const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require("express-rate-limit");
const { logUsuarioIn, postUsuario, getUsuarios, updateUsuario, updateContraseña, toggleUsuarioEstado, updateImagen, getImagen } = require("../service/usuarioService/service");
const { postPlantel, getPlanteles, getDetallePlantel, updatePlantelPrincipal, getProductosFromPlantelPrincipal } = require("../service/plantelService/service");
const { getProductos, getProducto, postProducto, putProductoCantidad } = require("../service/productoService/service");
const { getDepartamentos, getDepartamentosByPlantelId, postDepartamento, postDepartamentoByUsuario } = require("../service/departamentoService/service");


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const esEnteroPositivo = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'imagenes/') },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const errorRes = (res, status, mensaje, detalle = null) => {
  const body = { mensaje };
  if (detalle && process.env.NODE_ENV !== "production") body.detalle = detalle;
  return res.status(status).json(body);
};

// // ... JUST FOR TESTING PURPOSES
// router.get("/api/hello/", async(req, res) => {
//   res.json("Hello  world!");
// });

// ── LOGIN ────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 3, // maximum of 3 attempts
  keyGenerator: (req)=>{
    return req.body.correo || ipKeyGenerator(req.ip);
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiados intentos fallidos. Intentalo de nuevo en 15 minutos."
})

router.post("/api/login", loginLimiter, async (req, res) => {
  try{
    const { correo, password } = req.body;
    const result = await logUsuarioIn({correo, contraseña: password});
    return res.status(200).json({verificacion: true, usuario: result});
  }catch(err){
    // const code = err.statusCode || 500;
    console.log(err);
    // console.log("status code: ", err.statusCode);
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── USUARIOS ─────────────────────────────────────────────────
router.post("/api/usuario", async (req, res) => {
  try{
    const result = await postUsuario(req.body);
    return res.status(201).json({verificacion: true, mensaje: "Usuario creado correctamente.", usuario:result})
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// Gell all users
router.get("/api/usuarios", async (req, res) => {
  try{
    const result = await getUsuarios();
    return res.status(200).json(result);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// Update user
router.put("/api/usuario/editar", async (req, res) => {
  try{
    const result = await updateUsuario(req.body);
    return res.status(200).json({mensaje: "Usuario actualizado correctamente.", usuario:result});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// Update user password
router.put("/api/cambiarpassword", async (req, res) => {
  try{
    await updateContraseña(req.body);
    return res.status(200).json({verificacion:true, mensaje: "Contraseña actualizada correctamente."});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

//User's soft deletion
router.put("/api/cambiarEstado", async (req, res) => {
  try{
    const result = await toggleUsuarioEstado(req.body);
    return res.status(200).json({ verificacion: true, mensaje: `Usuario ${result.esta_activo? 'activado' : 'deshabilitado'} correctamente.`, nuevoEstado: result.esta_activo});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── GET /api/avatares ────────────────────────────────────────
// Lista solo los archivos de la carpeta imagenes/avatares/
router.get("/api/avatares", (req, res) => {
  const carpeta = path.join(__dirname, '../../../imagenes/avatares');

  // Crear la carpeta si no existe
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }

  fs.readdir(carpeta, (err, files) => {
    if (err) return res.status(500).json({ mensaje: "Error al leer avatares" });
    const imagenes = files.filter(f =>
      ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(path.extname(f).toLowerCase())
    );
    res.status(200).json(imagenes);
  });
});

// ── PUT /api/usuario/imagen ──────────────────────────────────
// Actualiza la imagen del usuario en sesión
router.put("/api/usuario/imagen", async (req, res) => {
  try{
    const result  = await updateImagen(req.body);
    res.status(200).json({ mensaje: "Imagen actualizada correctamente", imagen: result });
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── GET /api/usuario/:id/imagen ──────────────────────────────
// Obtiene la imagen actual del usuario
router.get("/api/usuario/:id/imagen", async (req, res) => {
  try{
    const result = await getImagen(req.params);
    res.status(200).json({mensaje: "Imagen obtenida correctamente.", imagen: result});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── PLANTELES ────────────────────────────────────────────────
router.post("/api/plantel", upload.single('imagen'), async (req, res) => {
  try{
    const result = await postPlantel(req.body, req.file);
    return res.status(201).json(result);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

router.get("/api/planteles", async (req, res) => {
  try{
    const result = await getPlanteles();
    return res.status(200).json(result);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── GET /api/planteles/detalle/:id ───────────────────────────
router.get("/api/planteles/detalle/:id", async (req, res) => {
  try{
    const {plantel, productos, usuarios} = await getDetallePlantel(req.params);
    return res.status(200).json({plantel, productos, usuarios})
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── PATCH /api/planteles/:id/principal ───────────────────────
router.patch("/api/planteles/:id/principal", async (req, res) => {
  try{
    const result = await updatePlantelPrincipal(req.params);
    return res.status(200).json({mensaje: "Plantel principal actualizado correctamente."})
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── GET /api/productos/principal ─────────────────────────────
// Devuelve productos del plantel marcado como es_principal = true
router.get("/api/productos/principal", async (req, res) => {
  try{
    const result = await getProductosFromPlantelPrincipal();
    return res.status(200).json(result);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

// ── PRODUCTOS ────────────────────────────────────────────────
router.get("/api/productos", async (req, res) => {
  try{
    const products = await getProductos();
    return res.status(200).json(products);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

router.post("/api/productos/detalle", async (req, res) => {
  try{
    const producto =  await getProducto(req.body);
    return res.status(200).json(producto);
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }
});

router.post("/api/productos", async (req, res) => {
  try{
    const {mensaje, accion, producto} = await postProducto(req.body);
    return res.status(producto.es_nuevo ? 201 : 200).json({ mensaje: mensaje, accion: accion, producto: producto});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."}); 
  }

  // const { nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento } = req.body;
  // const faltantes = [];
  // if (!nombre) faltantes.push("nombre");
  // if (!num_serie) faltantes.push("num_serie");
  // if (!cantidad) faltantes.push("cantidad");
  // if (!id_plantel) faltantes.push("id_plantel");
  // if (!id_departamento) faltantes.push("id_departamento");
  // if (faltantes.length > 0) return errorRes(res, 400, `Faltan campos requeridos: ${faltantes.join(", ")}`);
  // if (!esEnteroPositivo(cantidad)) return errorRes(res, 400, "La cantidad debe ser un número entero positivo");
  // try {
  //   const existe = await db.query("SELECT id_productos, cantidad FROM productos WHERE num_serie = $1 AND id_plantel = $2", [num_serie, parseInt(id_plantel)]);
  //   if (existe.rows.length > 0) {
  //     const actualizado = await db.query(
  //       `UPDATE productos SET cantidad = cantidad + $1, actualizacion = NOW() WHERE num_serie = $2 AND id_plantel = $3 RETURNING *`,
  //       [parseInt(cantidad), num_serie, parseInt(id_plantel)]
  //     );
  //     return res.status(200).json({ mensaje: `Producto ya existente. Se agregaron ${cantidad} unidades.`, accion: "cantidad_actualizada", producto: actualizado.rows[0] });
  //   }
  //   const nuevo = await db.query(
  //     `INSERT INTO productos (nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento, creacion, actualizacion)
  //      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
  //     [nombre, descripcion || null, modelo || null, parseInt(cantidad), num_serie, parseInt(id_plantel), parseInt(id_departamento)]
  //   );
  //   return res.status(201).json({ mensaje: "Producto creado correctamente", accion: "creado", producto: nuevo.rows[0] });
  // } catch (err) {
  //   return errorRes(res, 500, "Error al crear/actualizar el producto", err.message);
  // }
});

router.put("/api/productos/cantidad", async (req, res) => {
  try{
    const {mensaje, producto} = await putProductoCantidad(req.body);
    return res.status(200).json({mensaje: mensaje, producto: producto});
  }catch(err){
    return res.status(err?.statusCode || 500).json({verificacion: false, mensaje: err?.message || "Error interno del servidor."});
  }
  // const { id_productos, operacion, cantidad } = req.body;
  // if (!id_productos || !esEnteroPositivo(id_productos)) return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  // if (!["agregar", "restar"].includes(operacion)) return errorRes(res, 400, 'operacion debe ser "agregar" o "restar"');
  // if (!cantidad || !esEnteroPositivo(cantidad)) return errorRes(res, 400, "cantidad debe ser un número entero positivo");
  // try {
  //   const actual = await db.query("SELECT id_productos, cantidad FROM productos WHERE id_productos = $1", [id_productos]);
  //   if (actual.rows.length === 0) return errorRes(res, 404, "Producto no encontrado");
  //   if (operacion === "restar" && actual.rows[0].cantidad < parseInt(cantidad)) {
  //     return errorRes(res, 400, `Stock insuficiente. Disponible: ${actual.rows[0].cantidad}, solicitado: ${cantidad}`);
  //   }
  //   const signo = operacion === "agregar" ? "+" : "-";
  //   const result = await db.query(
  //     `UPDATE productos SET cantidad = cantidad ${signo} $1, actualizacion = NOW() WHERE id_productos = $2 RETURNING *`,
  //     [parseInt(cantidad), id_productos]
  //   );
  //   return res.status(200).json({ mensaje: `Se ${operacion === "agregar" ? "agregaron" : "restaron"} ${cantidad} unidades`, producto: result.rows[0] });
  // } catch (err) {
  //   return errorRes(res, 500, "Error al actualizar la cantidad", err.message);
  // }
});

router.put("/api/productos/editar", async (req, res) => {
  const { id_productos, nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento } = req.body;
  if (!id_productos || !esEnteroPositivo(id_productos)) return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  if (cantidad !== undefined && !esEnteroPositivo(cantidad)) return errorRes(res, 400, "cantidad debe ser un número entero positivo");
  const camposRecibidos = [nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento];
  if (camposRecibidos.every((v) => v === undefined || v === null || v === "")) return errorRes(res, 400, "Debes enviar al menos un campo para actualizar");
  try {
    const result = await db.query(
      `UPDATE productos SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion),
       modelo = COALESCE($3, modelo), cantidad = COALESCE($4, cantidad), num_serie = COALESCE($5, num_serie),
       id_plantel = COALESCE($6, id_plantel), id_departamento = COALESCE($7, id_departamento), actualizacion = NOW()
       WHERE id_productos = $8 RETURNING *`,
      [nombre || null, descripcion || null, modelo || null, cantidad ? parseInt(cantidad) : null,
      num_serie || null, id_plantel ? parseInt(id_plantel) : null, id_departamento ? parseInt(id_departamento) : null, id_productos]
    );
    if (result.rows.length === 0) return errorRes(res, 404, "Producto no encontrado");
    return res.status(200).json({ mensaje: "Producto actualizado correctamente", producto: result.rows[0] });
  } catch (err) {
    return errorRes(res, 500, "Error al editar el producto", err.message);
  }
});

router.delete("/api/productos/eliminar", async (req, res) => {
  const { id_productos } = req.body;
  if (!id_productos || !esEnteroPositivo(id_productos)) return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  try {
    const result = await db.query("DELETE FROM productos WHERE id_productos = $1 RETURNING *", [id_productos]);
    if (result.rows.length === 0) return errorRes(res, 404, "Producto no encontrado");
    return res.status(200).json({ mensaje: "Producto eliminado correctamente", producto: result.rows[0] });
  } catch (err) {
    return errorRes(res, 500, "Error al eliminar el producto", err.message);
  }
});

router.post("/api/productos/buscar", async (req, res) => {
  const { q } = req.body;
  if (!q || q.trim().length < 2) return errorRes(res, 400, "El término de búsqueda debe tener al menos 2 caracteres");
  try {
    const result = await db.query(
      `SELECT pr.id_productos, pr.nombre, pr.descripcion, pr.modelo, pr.cantidad, pr.num_serie,
              p.nombre AS plantel, d.nombre AS departamento
       FROM productos pr
       INNER JOIN planteles p ON pr.id_plantel = p.id_plantel
       INNER JOIN departamento d ON pr.id_departamento = d.id_departamento
       WHERE pr.nombre ILIKE $1 OR pr.modelo ILIKE $1 OR pr.num_serie ILIKE $1
       ORDER BY pr.nombre ASC`,
      [`%${q.trim()}%`]
    );
    if (result.rows.length === 0) return res.status(404).json({ mensaje: "No se encontraron productos con ese criterio" });
    return res.status(200).json(result.rows);
  } catch (err) {
    return errorRes(res, 500, "Error al buscar productos", err.message);
  }
});

// ── DEPARTAMENTOS ────────────────────────────────────────────
router.post("/api/departamentos", async (req, res) => {
  try {
    const result = await postDepartamento(req.body);
    return res.status(201).json({ mensaje: "Departamento creado correctamente", departamento: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ mensaje: error.message });
  }
});

// ── POST /api/departamentos/usuario ─────────────────────────
router.post("/api/departamentos/usuario", async (req, res) => {
  try {
    const result = await postDepartamentoByUsuario(req.body);
    return res.status(201).json({ mensaje: "Departamento creado correctamente", departamento: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ mensaje: error.message });
  }
});


router.get("/api/departamentos", async (req, res) => {
  try {
    const result = await getDepartamentos();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ mensaje: error.message });
  }
});

router.get("/api/departamentos/:id_plantel", async (req, res) => {
  try {
    const result = await getDepartamentosByPlantelId(req.params.id_plantel);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ mensaje: error.message });
  }
});

// ── REGISTROS ────────────────────────────────────────────────
router.post("/api/registros", async (req, res) => {
  const { tipo, nota, id_departamento, id_plantel, id_usuario, id_plantel_origen, productos } = req.body;
  if (!tipo || !id_departamento || !id_plantel || !id_usuario || !productos?.length) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora = ahora.toTimeString().split(" ")[0];
    const resRegistro = await client.query(
      `INSERT INTO registro (fecha, tipo, nota, id_departamento, id_plantel, id_usuario, id_plantel_origen)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_registro`,
      [`${fecha} ${hora}`, tipo, nota || null, parseInt(id_departamento), parseInt(id_plantel), parseInt(id_usuario), id_plantel_origen ? parseInt(id_plantel_origen) : null]
    );
    const id_registro = resRegistro.rows[0].id_registro;
    for (const p of productos) {
      await client.query(
        `INSERT INTO registro_productos (cantidad, id_productos, id_registro) VALUES ($1, $2, $3)`,
        [parseInt(p.cantidad), parseInt(p.id_productos), id_registro]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Registro creado correctamente", id_registro });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ mensaje: "Error al crear registro" });
  } finally {
    client.release();
  }
});

router.get("/api/registros", async (req, res) => {
  const id_plantel = req.headers['x-plantel'];
  if (!id_plantel) return res.status(400).json({ mensaje: "Header x-plantel requerido" });

  try {
    const sql = `
      SELECT
        MIN(r.id_registro)                          AS id_registro,
        TO_CHAR(DATE(r.fecha), 'YYYY-MM-DD')        AS fecha,
        r.tipo,
        r.id_departamento,
        d.nombre                                    AS departamento,
        p.nombre                                    AS plantel,
        po.nombre                                   AS plantel_origen,
        COUNT(DISTINCT r.id_registro)               AS total_movimientos,
        COUNT(rp.id_registro_productos)             AS total_productos,
        STRING_AGG(DISTINCT u.nombre, ', ')         AS usuario
      FROM registro r
      LEFT JOIN usuarios     u  ON u.id_usuario        = r.id_usuario
      LEFT JOIN departamento d  ON d.id_departamento   = r.id_departamento
      LEFT JOIN planteles    p  ON p.id_plantel        = r.id_plantel
      LEFT JOIN planteles    po ON po.id_plantel       = r.id_plantel_origen
      LEFT JOIN registro_productos rp ON rp.id_registro = r.id_registro
      WHERE r.id_plantel = $1  -- ✅ Solo registros del plantel del usuario
      GROUP BY DATE(r.fecha), r.tipo, r.id_departamento, d.nombre, p.nombre, po.nombre
      ORDER BY DATE(r.fecha) DESC, r.tipo, d.nombre
    `;
    const result = await db.query(sql, [parseInt(id_plantel)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener registros:", error);
    res.status(500).json({ mensaje: "Error al obtener registros" });
  }
});

router.get("/api/registros/detalle", async (req, res) => {
  const { 'x-fecha': fecha_dia, 'x-tipo': tipo, 'x-plantel': id_plantel, 'x-departamento': id_departamento } = req.headers;
  if (!fecha_dia || !tipo || !id_plantel || !id_departamento) {
    return res.status(400).json({ mensaje: "Headers x-fecha, x-tipo, x-plantel y x-departamento requeridos" });
  }

  try {
    const sql = `
      SELECT
        rp.id_registro_productos,
        TO_CHAR(r.fecha::timestamp, 'HH12:MI') || ' ' ||
          CASE WHEN EXTRACT(HOUR FROM r.fecha::timestamp) < 12 THEN 'a. m.' ELSE 'p. m.' END AS hora,
        r.nota,
        u.nombre       AS usuario,
        pr.nombre      AS producto,
        pr.modelo,
        pr.num_serie,
        pr.descripcion,
        rp.cantidad
      FROM registro r
      LEFT JOIN usuarios          u  ON u.id_usuario      = r.id_usuario
      JOIN registro_productos    rp  ON rp.id_registro    = r.id_registro
      JOIN productos             pr  ON pr.id_productos   = rp.id_productos
      WHERE DATE(r.fecha)     = $1
        AND r.tipo            = $2
        AND r.id_departamento = $3
        AND r.id_plantel      = $4  -- ✅ Solo el plantel del usuario, sin OR
      ORDER BY r.fecha ASC, pr.nombre ASC
    `;
    const result = await db.query(sql, [fecha_dia, tipo, parseInt(id_departamento), parseInt(id_plantel)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ mensaje: "Error al obtener detalle" });
  }
});

// ============================================================
// pedidos.backend.js
// ============================================================

// ── POST /api/pedidos ────────────────────────────────────────
// Usuario crea un pedido con sus productos
router.post("/api/pedidos", async (req, res) => {
  const { descripcion, id_plantel, id_usuario, productos } = req.body;
  if (!id_plantel || !id_usuario || !productos?.length) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const fecha = new Date().toISOString().split("T")[0];
    const resPedido = await client.query(
      `INSERT INTO pedidos (fecha, descripcion, id_plantel, estado, id_usuario)
       VALUES ($1, $2, $3, 'pendiente', $4) RETURNING id_pedido`,
      [fecha, descripcion || null, parseInt(id_plantel), parseInt(id_usuario)]
    );
    const id_pedido = resPedido.rows[0].id_pedido;
    for (const p of productos) {
      await client.query(
        `INSERT INTO detalle_pedido (cantidad, id_pedido, id_productos)
         VALUES ($1, $2, $3)`,
        [parseInt(p.cantidad), id_pedido, parseInt(p.id_productos)]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Pedido creado correctamente", id_pedido });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear pedido:", error);
    res.status(500).json({ mensaje: "Error al crear pedido" });
  } finally {
    client.release();
  }
});

// ── GET /api/pedidos/pendientes ──────────────────────────────
// Admin ve todos los pedidos pendientes
router.get("/api/pedidos/pendientes", async (req, res) => {
  try {
    const sql = `
      SELECT p.id_pedido, p.fecha, p.descripcion, p.estado,
             pl.nombre AS plantel, u.nombre AS usuario,
             COUNT(dp.id_detalle_pedido) AS total_productos
      FROM pedidos p
      LEFT JOIN planteles  pl ON pl.id_plantel = p.id_plantel
      LEFT JOIN usuarios    u ON u.id_usuario  = p.id_usuario
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      WHERE p.estado = 'pendiente'
      GROUP BY p.id_pedido, pl.nombre, u.nombre
      ORDER BY p.fecha DESC
    `;
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos pendientes:", error);
    res.status(500).json({ mensaje: "Error al obtener pedidos" });
  }
});

// ── GET /api/pedidos/aceptados ───────────────────────────────
// Admin ve pedidos aceptados (listos para enviar)
router.get("/api/pedidos/aceptados", async (req, res) => {
  try {
    const sql = `
      SELECT p.id_pedido, p.fecha, p.descripcion, p.estado,
             pl.nombre AS plantel, u.nombre AS usuario,
             COUNT(dp.id_detalle_pedido) AS total_productos
      FROM pedidos p
      LEFT JOIN planteles  pl ON pl.id_plantel = p.id_plantel
      LEFT JOIN usuarios    u ON u.id_usuario  = p.id_usuario
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      WHERE p.estado IN ('aceptado', 'en_camino')
      GROUP BY p.id_pedido, pl.nombre, u.nombre
      ORDER BY p.fecha DESC
    `;
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos aceptados:", error);
    res.status(500).json({ mensaje: "Error al obtener pedidos" });
  }
});

// ── GET /api/pedidos/mis-pedidos ─────────────────────────────
// Usuario ve sus propios pedidos
router.get("/api/pedidos/mis-pedidos", async (req, res) => {
  const id_plantel = req.headers['x-plantel'];
  if (!id_plantel) return res.status(400).json({ mensaje: "Header x-plantel requerido" });
  try {
    const sql = `
      SELECT p.id_pedido, p.fecha, p.descripcion, p.estado,
             pl.nombre AS plantel, u.nombre AS usuario,
             p.id_usuario AS id_usuario_envio,
             COUNT(dp.id_detalle_pedido) AS total_productos
      FROM pedidos p
      LEFT JOIN planteles  pl ON pl.id_plantel = p.id_plantel
      LEFT JOIN usuarios    u ON u.id_usuario  = p.id_usuario
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      WHERE p.id_plantel = $1
      GROUP BY p.id_pedido, pl.nombre, u.nombre, p.id_usuario
      ORDER BY p.fecha DESC
    `;
    const result = await db.query(sql, [parseInt(id_plantel)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({ mensaje: "Error al obtener pedidos" });
  }
});

// ── GET /api/pedidos/detalle ─────────────────────────────────
// Detalle de productos de un pedido (header x-pedido)
router.get("/api/pedidos/detalle", async (req, res) => {
  const id_pedido = req.headers['x-pedido'];
  if (!id_pedido) return res.status(400).json({ mensaje: "Header x-pedido requerido" });
  try {
    const sql = `
      SELECT dp.id_detalle_pedido, dp.cantidad,
             pr.nombre AS producto, pr.modelo, pr.num_serie, pr.descripcion,
             pr.cantidad AS stock_actual
      FROM detalle_pedido dp
      JOIN productos pr ON pr.id_productos = dp.id_productos
      WHERE dp.id_pedido = $1
      ORDER BY pr.nombre
    `;
    const result = await db.query(sql, [parseInt(id_pedido)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ mensaje: "Error al obtener detalle del pedido" });
  }
});

// ── PATCH /api/pedidos/:id/estado ────────────────────────────
// ── PATCH /api/pedidos/:id/estado ────────────────────────────
router.patch("/api/pedidos/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado, id_usuario_admin, id_plantel_admin } = req.body;

  const estadosValidos = ['aceptado', 'rechazado', 'en_camino'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido" });
  }

  // Solo valida stock pero NO lo modifica
  if (estado === 'en_camino') {
    if (!id_plantel_admin) return res.status(400).json({ mensaje: "Falta id_plantel_admin" });
    const detalle = await db.query(`
      SELECT dp.id_productos, dp.cantidad, pr.nombre
      FROM detalle_pedido dp
      JOIN productos pr ON pr.id_productos = dp.id_productos
      WHERE dp.id_pedido = $1
    `, [parseInt(id)]);
    for (const item of detalle.rows) {
      const stock = await db.query(
        `SELECT cantidad FROM productos WHERE id_productos = $1`, [item.id_productos]
      );
      if (!stock.rows.length || stock.rows[0].cantidad < item.cantidad) {
        return res.status(400).json({ mensaje: `Stock insuficiente para: ${item.nombre}` });
      }
    }
  }

  try {
    // ✅ Solo actualiza el estado, NO toca el stock
    await db.query(
      `UPDATE pedidos SET estado = $1 WHERE id_pedido = $2`,
      [estado, parseInt(id)]
    );
    res.status(200).json({ mensaje: `Pedido ${estado} correctamente` });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ mensaje: "Error al actualizar pedido" });
  }
});

// ── PATCH /api/pedidos/:id/entregado ─────────────────────────
// Usuario confirma entrega → AQUÍ se transfiere el stock y se generan registros
router.patch("/api/pedidos/:id/entregado", async (req, res) => {
  const { id } = req.params;
  const { id_usuario_admin } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE pedidos SET estado = 'entregado' WHERE id_pedido = $1`,
      [parseInt(id)]
    );

    // Plantel del admin
    const adminResult = await client.query(
      `SELECT id_plantel FROM usuarios WHERE rol = 'Admin' LIMIT 1`
    );
    if (adminResult.rows.length === 0) throw new Error("No se encontró un administrador");
    const plantelAdmin = adminResult.rows[0].id_plantel;

    // Detalle del pedido
    const detalle = await client.query(`
      SELECT dp.id_productos, dp.cantidad,
             pr.nombre, pr.descripcion, pr.modelo, pr.num_serie, pr.id_departamento,
             p.id_plantel AS plantel_destino
      FROM detalle_pedido dp
      JOIN productos pr ON pr.id_productos = dp.id_productos
      JOIN pedidos p ON p.id_pedido = dp.id_pedido
      WHERE dp.id_pedido = $1
    `, [parseInt(id)]);

    if (detalle.rows.length === 0) throw new Error("El pedido no tiene productos");

    const plantel_destino = detalle.rows[0].plantel_destino;

    // ✅ Buscar departamento "Control de Equipos y Soporte" del plantel destino
    const deptDestinoResult = await client.query(
      `SELECT id_departamento FROM departamento
       WHERE id_plantel = $1
       AND nombre ILIKE '%Control de Equipos%'
       LIMIT 1`,
      [plantel_destino]
    );

    if (deptDestinoResult.rows.length === 0) {
      throw new Error(`El plantel destino no tiene el departamento "Control de Equipos y Soporte"`);
    }
    const id_dept_destino = deptDestinoResult.rows[0].id_departamento;

    // ✅ Buscar departamento "Control de Equipos y Soporte" del plantel admin (origen)
    const deptOrigenResult = await client.query(
      `SELECT id_departamento FROM departamento
       WHERE id_plantel = $1
       AND nombre ILIKE '%Control de Equipos%'
       LIMIT 1`,
      [plantelAdmin]
    );

    if (deptOrigenResult.rows.length === 0) {
      throw new Error(`El plantel admin no tiene el departamento "Control de Equipos y Soporte"`);
    }
    const id_dept_origen = deptOrigenResult.rows[0].id_departamento;

    // Transferir stock
    for (const item of detalle.rows) {
      const stock = await client.query(
        `SELECT cantidad FROM productos WHERE id_productos = $1`,
        [item.id_productos]
      );
      if (!stock.rows.length || stock.rows[0].cantidad < item.cantidad) {
        throw new Error(`Stock insuficiente para: ${item.nombre}`);
      }

      // Restar en plantel admin
      await client.query(
        `UPDATE productos SET cantidad = cantidad - $1, actualizacion = NOW()
         WHERE id_productos = $2`,
        [item.cantidad, item.id_productos]
      );

      // Sumar o crear en plantel destino
      const existeDestino = await client.query(
        `SELECT id_productos FROM productos
         WHERE num_serie = $1 AND id_plantel = $2`,
        [item.num_serie, plantel_destino]
      );

      if (existeDestino.rows.length > 0) {
        await client.query(
          `UPDATE productos SET cantidad = cantidad + $1, actualizacion = NOW()
           WHERE id_productos = $2`,
          [item.cantidad, existeDestino.rows[0].id_productos]
        );
      } else {
        // ✅ Usar el departamento correcto del plantel destino
        await client.query(
          `INSERT INTO productos
           (nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento, creacion, actualizacion)
           VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
          [item.nombre, item.descripcion, item.modelo, item.cantidad,
          item.num_serie, plantel_destino, id_dept_destino] // ✅ id_dept_destino
        );
      }
    }

    // ✅ Registro SALIDA — departamento del plantel admin
    const salida = await client.query(
      `INSERT INTO registro (fecha, tipo, nota, id_departamento, id_plantel, id_usuario, id_plantel_origen)
       VALUES (NOW(), 'salida', $1, $2, $3, $4, $5) RETURNING id_registro`,
      [`Salida pedido #${id}`, id_dept_origen, plantelAdmin, id_usuario_admin, plantel_destino]
    );

    // ✅ Registro ENTRADA — departamento del plantel destino
    const entrada = await client.query(
      `INSERT INTO registro (fecha, tipo, nota, id_departamento, id_plantel, id_usuario, id_plantel_origen)
       VALUES (NOW(), 'entrada', $1, $2, $3, $4, $5) RETURNING id_registro`,
      [`Entrada pedido #${id}`, id_dept_destino, plantel_destino, id_usuario_admin, plantelAdmin]
    );

    // Insertar productos en ambos registros
    for (const item of detalle.rows) {
      await client.query(
        `INSERT INTO registro_productos (cantidad, id_productos, id_registro) VALUES ($1,$2,$3)`,
        [item.cantidad, item.id_productos, salida.rows[0].id_registro]
      );
      await client.query(
        `INSERT INTO registro_productos (cantidad, id_productos, id_registro) VALUES ($1,$2,$3)`,
        [item.cantidad, item.id_productos, entrada.rows[0].id_registro]
      );
    }

    await client.query("COMMIT");
    res.status(200).json({ mensaje: "Entrega confirmada e inventario actualizado correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al confirmar entrega:", error);
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : "Error al confirmar entrega"
    });
  } finally {
    client.release();
  }
});

// ── POST /api/solicitudes ────────────────────────────────────
router.post("/api/solicitudes", async (req, res) => {
  const { nombre, descripcion, modelo, cantidad, id_usuario, id_plantel } = req.body;
  if (!nombre || !id_usuario || !id_plantel) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }
  try {
    await db.query(
      `INSERT INTO solicitud_producto (nombre, descripcion, modelo, cantidad, estado, id_usuario, id_plantel)
       VALUES ($1, $2, $3, $4, 'pendiente', $5, $6)`,
      [nombre, descripcion || null, modelo || null, cantidad || 1, parseInt(id_usuario), parseInt(id_plantel)]
    );
    res.status(201).json({ mensaje: "Solicitud enviada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear solicitud" });
  }
});

// ── GET /api/solicitudes ─────────────────────────────────────
router.get("/api/solicitudes", async (req, res) => {
  try {
    const sql = `
      SELECT sp.id_solicitud, sp.nombre, sp.descripcion, sp.modelo,
             sp.cantidad, sp.estado, sp.id_plantel,
             u.nombre AS usuario, pl.nombre AS plantel
      FROM solicitud_producto sp
      LEFT JOIN usuarios  u  ON u.id_usuario  = sp.id_usuario
      LEFT JOIN planteles pl ON pl.id_plantel = sp.id_plantel
      ORDER BY sp.id_solicitud DESC
    `;
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
});

// ── GET /api/solicitudes/atendidas ───────────────────────────
router.get("/api/solicitudes/atendidas", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_solicitud, nombre, descripcion, modelo, cantidad, id_plantel
      FROM solicitud_producto
      WHERE estado = 'atendido' AND id_producto_creado IS NULL
      ORDER BY id_solicitud DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener solicitudes atendidas" });
  }
});

// ── PATCH /api/solicitudes/:id/estado ───────────────────────
router.patch("/api/solicitudes/:id/estado", async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query(
      `UPDATE solicitud_producto SET estado = $1 WHERE id_solicitud = $2`,
      [estado, parseInt(req.params.id)]
    );
    res.status(200).json({ mensaje: "Solicitud actualizada" });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    res.status(500).json({ mensaje: "Error al actualizar solicitud" });
  }
});

// ── PATCH /api/solicitudes/:id/usar ─────────────────────────
router.patch("/api/solicitudes/:id/usar", async (req, res) => {
  const { id } = req.params;
  const { id_producto_creado, id_plantel_destino, id_productos, cantidad } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const solicitud = await client.query(
      `UPDATE solicitud_producto SET id_producto_creado = $1 
       WHERE id_solicitud = $2 RETURNING id_usuario, id_plantel`,
      [id_producto_creado, parseInt(id)]
    );

    const { id_usuario, id_plantel } = solicitud.rows[0];
    const fecha = new Date().toISOString().split("T")[0];

    const resPedido = await client.query(
      `INSERT INTO pedidos (fecha, descripcion, id_plantel, estado, id_usuario)
       VALUES ($1, $2, $3, 'aceptado', $4) RETURNING id_pedido`,
      [fecha, 'Entrega de producto solicitado', id_plantel, id_usuario]
    );

    await client.query(
      `INSERT INTO detalle_pedido (cantidad, id_pedido, id_productos) VALUES ($1, $2, $3)`,
      [cantidad, resPedido.rows[0].id_pedido, id_productos]
    );

    await client.query("COMMIT");
    res.status(200).json({ mensaje: "Solicitud marcada y pedido creado correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al marcar solicitud:", error);
    res.status(500).json({ mensaje: "Error al procesar solicitud" });
  } finally {
    client.release();
  }
});

// ── GET /api/general/admin ───────────────────────────────────
router.get("/api/general/admin", async (req, res) => {
  try {
    const mes = new Date().getMonth() + 1;
    const anio = new Date().getFullYear();

    // ✅ Obtener el plantel del admin (es_principal = true)
    const plantelAdminResult = await db.query(
      `SELECT id_plantel FROM planteles WHERE es_principal = true LIMIT 1`
    );
    if (plantelAdminResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró el plantel principal" });
    }
    const id_plantel_admin = plantelAdminResult.rows[0].id_plantel;

    const [entradas, salidas, stockTotal, stockBajo, pedidosPendientes,
      solicitudesPendientes, pedidosPorPlantel,
      productosmasSolicitados, pedidosRecientes] = await Promise.all([

        // ✅ Solo entradas del plantel admin
        db.query(`SELECT COUNT(*) AS total FROM registro
                WHERE tipo = 'entrada'
                AND id_plantel = $1
                AND EXTRACT(MONTH FROM fecha::timestamp) = $2
                AND EXTRACT(YEAR  FROM fecha::timestamp) = $3`,
          [id_plantel_admin, mes, anio]),

        // ✅ Solo salidas del plantel admin
        db.query(`SELECT COUNT(*) AS total FROM registro
                WHERE tipo = 'salida'
                AND id_plantel = $1
                AND EXTRACT(MONTH FROM fecha::timestamp) = $2
                AND EXTRACT(YEAR  FROM fecha::timestamp) = $3`,
          [id_plantel_admin, mes, anio]),

        // ✅ Solo productos del plantel admin
        db.query(`SELECT COUNT(*) AS total FROM productos
                WHERE id_plantel = $1 AND cantidad > 0`,
          [id_plantel_admin]),

        // ✅ Solo stock bajo del plantel admin
        db.query(`SELECT COUNT(*) AS total FROM productos
                WHERE id_plantel = $1 AND cantidad > 0 AND cantidad <= 5`,
          [id_plantel_admin]),

        db.query(`SELECT COUNT(*) AS total FROM pedidos WHERE estado = 'pendiente'`),

        db.query(`SELECT COUNT(*) AS total FROM solicitud_producto WHERE estado = 'pendiente'`),

        // Pedidos por plantel este mes (gráfica pastel)
        db.query(`
        SELECT pl.nombre AS plantel, COUNT(p.id_pedido) AS total
        FROM pedidos p
        JOIN planteles pl ON pl.id_plantel = p.id_plantel
        WHERE EXTRACT(MONTH FROM p.fecha::date) = $1
        AND   EXTRACT(YEAR  FROM p.fecha::date) = $2
        GROUP BY pl.nombre
        ORDER BY total DESC
      `, [mes, anio]),

        // ✅ Productos más solicitados en pedidos (gráfica barras)
        db.query(`
        SELECT pr.nombre AS producto, SUM(dp.cantidad) AS total
        FROM detalle_pedido dp
        JOIN productos pr ON pr.id_productos = dp.id_productos
        JOIN pedidos p ON p.id_pedido = dp.id_pedido
        WHERE EXTRACT(MONTH FROM p.fecha::date) = $1
        AND   EXTRACT(YEAR  FROM p.fecha::date) = $2
        GROUP BY pr.nombre
        ORDER BY total DESC
        LIMIT 8
      `, [mes, anio]),

        // Pedidos recientes
        db.query(`
        SELECT p.id_pedido, p.fecha, p.descripcion, p.estado,
               pl.nombre AS plantel, u.nombre AS usuario,
               u.imagen AS usuario_imagen,
               COUNT(dp.id_detalle_pedido) AS total_productos
        FROM pedidos p
        LEFT JOIN planteles pl ON pl.id_plantel = p.id_plantel
        LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
        LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
        GROUP BY p.id_pedido, pl.nombre, u.nombre, u.imagen
        ORDER BY p.fecha::date DESC
        LIMIT 10
      `)
      ]);

    res.status(200).json({
      entradas: parseInt(entradas.rows[0].total),
      salidas: parseInt(salidas.rows[0].total),
      stockTotal: parseInt(stockTotal.rows[0].total),
      stockBajo: parseInt(stockBajo.rows[0].total),
      pedidosPendientes: parseInt(pedidosPendientes.rows[0].total),
      solicitudesPendientes: parseInt(solicitudesPendientes.rows[0].total),
      pedidosPorPlantel: pedidosPorPlantel.rows,
      productosMasSolicitados: productosmasSolicitados.rows, // ✅ nuevo
      pedidosRecientes: pedidosRecientes.rows
    });
  } catch (error) {
    console.error("Error en general admin:", error);
    res.status(500).json({ mensaje: "Error al obtener datos generales" });
  }
});

// ── GET /api/general/usuario ─────────────────────────────────
router.get("/api/general/usuario", async (req, res) => {
  const id_plantel = req.headers['x-plantel'];
  if (!id_plantel) return res.status(400).json({ mensaje: "Header x-plantel requerido" });

  try {
    const mes = new Date().getMonth() + 1;
    const anio = new Date().getFullYear();

    const [misPedidos, pedidosEntregados, pedidosPendientes,
      solicitudes, productosDisponibles, pedidosRecientes] = await Promise.all([

        // ✅ Cast a date para que EXTRACT funcione
        db.query(`SELECT COUNT(*) AS total FROM pedidos
                WHERE id_plantel = $1
                AND EXTRACT(MONTH FROM fecha::date) = $2
                AND EXTRACT(YEAR  FROM fecha::date) = $3`,
          [parseInt(id_plantel), mes, anio]),

        db.query(`SELECT COUNT(*) AS total FROM pedidos
                WHERE id_plantel = $1 AND estado = 'entregado'`,
          [parseInt(id_plantel)]),

        db.query(`SELECT COUNT(*) AS total FROM pedidos
                WHERE id_plantel = $1 AND estado IN ('pendiente','aceptado','en_camino')`,
          [parseInt(id_plantel)]),

        db.query(`SELECT COUNT(*) AS total FROM solicitud_producto
                WHERE id_plantel = $1 AND estado = 'pendiente'`,
          [parseInt(id_plantel)]),

        db.query(`SELECT COUNT(*) AS total FROM productos pr
                JOIN planteles p ON p.id_plantel = pr.id_plantel
                WHERE p.es_principal = true AND pr.cantidad > 0`),

        db.query(`
        SELECT p.id_pedido, p.fecha, p.descripcion, p.estado,
               pl.nombre AS plantel, u.nombre AS usuario,
               COUNT(dp.id_detalle_pedido) AS total_productos
        FROM pedidos p
        LEFT JOIN planteles pl ON pl.id_plantel = p.id_plantel
        LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
        LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
        WHERE p.id_plantel = $1
        GROUP BY p.id_pedido, pl.nombre, u.nombre
        ORDER BY p.fecha::date DESC
        LIMIT 8
      `, [parseInt(id_plantel)])
      ]);

    res.status(200).json({
      misPedidos: parseInt(misPedidos.rows[0].total),
      pedidosEntregados: parseInt(pedidosEntregados.rows[0].total),
      pedidosPendientes: parseInt(pedidosPendientes.rows[0].total),
      solicitudesPendientes: parseInt(solicitudes.rows[0].total),
      productosDisponibles: parseInt(productosDisponibles.rows[0].total),
      pedidosRecientes: pedidosRecientes.rows
    });
  } catch (error) {
    console.error("Error en general usuario:", error);
    res.status(500).json({ mensaje: "Error al obtener datos generales" });
  }
});

// ✅ module.exports SIEMPRE AL FINAL
module.exports = router;