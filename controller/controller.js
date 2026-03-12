const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const multer = require('multer');
const path = require('path');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

const esEnteroPositivo = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'imagenes/') 
    },
    filename: function (req, file, cb) {
        // Le damos un nombre único para que no se borren fotos con el mismo nombre
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

router.post("/api/login", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({
            verificacion: false,
            mensaje: "Campos obligatorios: correo y password"
        });
    }

    try {
        // Agregamos id_usuario al SELECT
        const sql = "SELECT id_usuario, correo, password, nombre, rol, id_plantel FROM usuarios WHERE correo = $1";
        const result = await db.query(sql, [correo]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                verificacion: false,
                mensaje: "Correo o contraseña incorrectos"
            });
        }

        const usuario = result.rows[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (match) {
            return res.status(200).json({
                verificacion: true,
                // Agregamos id_usuario a la respuesta
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre:     usuario.nombre,
                    plantel:    usuario.id_plantel,
                    rol:        usuario.rol
                }
            });
        } else {
            return res.status(401).json({
                verificacion: false,
                mensaje: "Correo o contraseña incorrectos"
            });
        }

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({
            verificacion: false,
            mensaje: "Error interno del servidor"
        });
    }
});

router.post("/api/usuario", async (req, res) => {

    const { nombre, apellidos, correo, password, rol, id_plantel } = req.body;

    if (!id_plantel || id_plantel === "undefined") {
        return res.status(400).json({
            mensaje: "Debes seleccionar un plantel válido"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `
      INSERT INTO usuarios (nombre, apellidos, correo, password, rol, id_plantel)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `;

        const result = await db.query(sql, [
            nombre,
            apellidos,
            correo,
            hashedPassword,
            rol,
            parseInt(id_plantel)
        ]);

        res.status(201).json({
            mensaje: "Usuario creado correctamente",
            usuario: result.rows[0]
        });

    } catch (error) {

        console.error("Error al crear usuario:", error);

        res.status(500).json({
            mensaje: "Error al crear usuario"
        });

    }

});

router.post("/api/plantel", upload.single('imagen'), (req, res) => {
    const { nombre } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const sql = "INSERT into planteles(nombre, imagen) VALUES ($1, $2) RETURNING *";

    db.query(sql, [nombre, imagen], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: "Error al guardar el plantel", detalle: err.message });
        }
        return res.status(201).json(result.rows[0]);
    });
});

router.get("/api/planteles", (req, res) => {
    const sql = "SELECT id_plantel,nombre, imagen from planteles";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error al obtener planteles:", err);
            return res.status(500).json({
                mensaje: "Error al consultar los planteles",
                detalle: err.message
            })
        }
        return res.status(200).json(result.rows)
    })
})

router.get("/api/usuarios", (req, res) => {
    const sql = "SELECT u.nombre,u.apellidos,u.rol,u.correo,u.estado,p.nombre AS plantel FROM usuarios u INNER JOIN planteles p ON u.id_plantel = p.id_plantel";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            return res.status(500).json({
                mensaje: "Error al consultar los usuarios",
                detalle: err.message
            })
        }
        return res.status(200).json(result.rows)
    })
})

router.put("/api/cambiarPassword", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({
            verificacion: false,
            mensaje: "Campos obligatorios: correo y password"
        });
    }

    try {
        const newPassword = await bcrypt.hash(password, saltRounds);

        const sql = "UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING *";
        const result = await db.query(sql, [newPassword, correo]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                verificacion: false,
                mensaje: "No se encontró un usuario con ese correo"
            });
        }

        return res.status(200).json({
            verificacion: true,
            mensaje: "Contraseña actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        return res.status(500).json({
            verificacion: false,
            mensaje: "Error interno del servidor"
        });
    }
});

router.put("/api/cambiarEstado", async (req, res) => {
    const { correo, estado } = req.body;

    if (!correo) {
        return res.status(400).json({
            verificacion: false,
            mensaje: "Campos obligatorios: correo"
        });
    }

    try {
        const sql = "UPDATE usuarios SET estado = $1 WHERE correo = $2 RETURNING *";
        const result = await db.query(sql, [estado, correo]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                verificacion: false,
                mensaje: "No se encontró un usuario con ese correo"
            });
        }

        const nuevoEstadoTexto = estado ? "habilitado" : "inhabilitado";
        return res.status(200).json({
            verificacion: true,
            mensaje: `Usuario ${nuevoEstadoTexto} correctamente`,
            nuevoEstado: estado
        });

    } catch (error) {
        console.error("Error al cambiar estado del usuario:", error);
        return res.status(500).json({
            verificacion: false,
            mensaje: "Error interno del servidor"
        });
    }
});

router.post("/api/producto", async (req, res) => {
    const { nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento } = req.body;
    if (!nombre || !cantidad || !id_plantel || id_departamento || num_serie || descripcion || modelo) {
        return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }
    try {
        const sql = `
      INSERT INTO productos (nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
        const result = await db.query(sql, [nombre, descripcion, modelo, cantidad, num_serie, parseInt(id_plantel), parseInt(id_departamento)]);

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            producto: result.rows[0]
        });
    } catch (error) {

        console.error("Error al crear producto:", error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });

    }
})

router.get("/api/productos", async (req, res) => {
  try {
    const sql = `
      SELECT
        pr.id_productos,
        pr.nombre,
        pr.descripcion,
        pr.modelo,
        pr.cantidad,
        pr.num_serie,
        pr.creacion,
        pr.actualizacion,
        p.nombre  AS plantel,
        d.nombre  AS departamento
      FROM productos pr
      INNER JOIN planteles     p ON pr.id_plantel      = p.id_plantel
      INNER JOIN departamento d ON pr.id_departamento = d.id_departamento
      ORDER BY pr.creacion DESC
    `;
    const result = await db.query(sql);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron productos" });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET /api/productos:", err);
    return errorRes(res, 500, "Error al consultar los productos", err.message);
  }
});

router.post("/api/productos/detalle", async (req, res) => {
  const { id_productos } = req.body;

  if (!id_productos || !esEnteroPositivo(id_productos)) {
    return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  }

  try {
    const sql = `
      SELECT
        pr.id_productos,
        pr.nombre,
        pr.descripcion,
        pr.modelo,
        pr.cantidad,
        pr.num_serie,
        pr.creacion,
        pr.actualizacion,
        p.nombre  AS plantel,
        d.nombre  AS departamento
      FROM productos pr
      INNER JOIN planteles     p ON pr.id_plantel      = p.id_plantel
      INNER JOIN departamento d ON pr.id_departamento = d.id_departamento
      WHERE pr.id_productos = $1
    `;
    const result = await db.query(sql, [id_productos]);

    if (result.rows.length === 0) {
      return errorRes(res, 404, "Producto no encontrado");
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/productos/detalle:", err);
    return errorRes(res, 500, "Error al consultar el producto", err.message);
  }
});

router.post("/api/productos", async (req, res) => {
  const { nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento } = req.body;

  const faltantes = [];
  if (!nombre)          faltantes.push("nombre");
  if (!num_serie)       faltantes.push("num_serie");
  if (!cantidad)        faltantes.push("cantidad");
  if (!id_plantel)      faltantes.push("id_plantel");
  if (!id_departamento) faltantes.push("id_departamento");

  if (faltantes.length > 0) {
    return errorRes(res, 400, `Faltan campos requeridos: ${faltantes.join(", ")}`);
  }

  if (!esEnteroPositivo(cantidad)) {
    return errorRes(res, 400, "La cantidad debe ser un número entero positivo");
  }

  try {
    const existe = await db.query(
      "SELECT id_productos, cantidad FROM productos WHERE num_serie = $1",
      [num_serie]
    );

    if (existe.rows.length > 0) {
      // Ya existe → sumar cantidad
      const actualizado = await db.query(
        `UPDATE productos
         SET cantidad      = cantidad + $1,
             actualizacion = NOW()
         WHERE num_serie = $2
         RETURNING *`,
        [parseInt(cantidad), num_serie]
      );

      return res.status(200).json({
        mensaje: `Producto ya existente. Se agregaron ${cantidad} unidades. Total: ${actualizado.rows[0].cantidad}`,
        accion: "cantidad_actualizada",
        producto: actualizado.rows[0],
      });
    }

    // No existe → crear nuevo
    const nuevo = await db.query(
      `INSERT INTO productos
         (nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento, creacion, actualizacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), NOW())
       RETURNING *`,
      [
        nombre,
        descripcion  || null,
        modelo       || null,
        parseInt(cantidad),
        num_serie,
        parseInt(id_plantel),
        parseInt(id_departamento),
      ]
    );

    return res.status(201).json({
      mensaje: "Producto creado correctamente",
      accion: "creado",
      producto: nuevo.rows[0],
    });

  } catch (err) {
    console.error("POST /api/productos:", err);
    return errorRes(res, 500, "Error al crear/actualizar el producto", err.message);
  }
});

router.put("/api/productos/cantidad", async (req, res) => {
  const { id_productos, operacion, cantidad } = req.body;

  if (!id_productos || !esEnteroPositivo(id_productos)) {
    return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  }
  if (!["agregar", "restar"].includes(operacion)) {
    return errorRes(res, 400, 'operacion debe ser "agregar" o "restar"');
  }
  if (!cantidad || !esEnteroPositivo(cantidad)) {
    return errorRes(res, 400, "cantidad debe ser un número entero positivo");
  }

  try {
    const actual = await db.query(
      "SELECT id_productos, cantidad FROM productos WHERE id_productos = $1",
      [id_productos]
    );

    if (actual.rows.length === 0) {
      return errorRes(res, 404, "Producto no encontrado");
    }

    if (operacion === "restar" && actual.rows[0].cantidad < parseInt(cantidad)) {
      return errorRes(
        res, 400,
        `Stock insuficiente. Disponible: ${actual.rows[0].cantidad}, solicitado: ${cantidad}`
      );
    }

    const signo = operacion === "agregar" ? "+" : "-";

    const result = await db.query(
      `UPDATE productos
       SET cantidad      = cantidad ${signo} $1,
           actualizacion = NOW()
       WHERE id_productos = $2
       RETURNING *`,
      [parseInt(cantidad), id_productos]
    );

    return res.status(200).json({
      mensaje: `Se ${operacion === "agregar" ? "agregaron" : "restaron"} ${cantidad} unidades`,
      producto: result.rows[0],
    });

  } catch (err) {
    console.error("PUT /api/productos/cantidad:", err);
    return errorRes(res, 500, "Error al actualizar la cantidad", err.message);
  }
});

router.put("/api/productos/editar", async (req, res) => {
  const {
    id_productos, nombre, descripcion, modelo,
    cantidad, num_serie, id_plantel, id_departamento
  } = req.body;

  if (!id_productos || !esEnteroPositivo(id_productos)) {
    return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  }

  if (cantidad !== undefined && !esEnteroPositivo(cantidad)) {
    return errorRes(res, 400, "cantidad debe ser un número entero positivo");
  }

  const camposRecibidos = [nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento];
  if (camposRecibidos.every((v) => v === undefined || v === null || v === "")) {
    return errorRes(res, 400, "Debes enviar al menos un campo para actualizar");
  }

  try {
    const result = await db.query(
      `UPDATE productos SET
         nombre          = COALESCE($1, nombre),
         descripcion     = COALESCE($2, descripcion),
         modelo          = COALESCE($3, modelo),
         cantidad        = COALESCE($4, cantidad),
         num_serie       = COALESCE($5, num_serie),
         id_plantel      = COALESCE($6, id_plantel),
         id_departamento = COALESCE($7, id_departamento),
         actualizacion   = NOW()
       WHERE id_productos = $8
       RETURNING *`,
      [
        nombre          || null,
        descripcion     || null,
        modelo          || null,
        cantidad        ? parseInt(cantidad)        : null,
        num_serie       || null,
        id_plantel      ? parseInt(id_plantel)      : null,
        id_departamento ? parseInt(id_departamento) : null,
        id_productos,
      ]
    );

    if (result.rows.length === 0) {
      return errorRes(res, 404, "Producto no encontrado");
    }

    return res.status(200).json({
      mensaje: "Producto actualizado correctamente",
      producto: result.rows[0],
    });

  } catch (err) {
    console.error("PUT /api/productos/editar:", err);
    return errorRes(res, 500, "Error al editar el producto", err.message);
  }
});

router.delete("/api/productos/eliminar", async (req, res) => {
  const { id_productos } = req.body;

  if (!id_productos || !esEnteroPositivo(id_productos)) {
    return errorRes(res, 400, "id_productos es requerido y debe ser un entero positivo");
  }

  try {
    const result = await db.query(
      "DELETE FROM productos WHERE id_productos = $1 RETURNING *",
      [id_productos]
    );

    if (result.rows.length === 0) {
      return errorRes(res, 404, "Producto no encontrado");
    }

    return res.status(200).json({
      mensaje: "Producto eliminado correctamente",
      producto: result.rows[0],
    });

  } catch (err) {
    console.error("DELETE /api/productos/eliminar:", err);
    return errorRes(res, 500, "Error al eliminar el producto", err.message);
  }
});

router.post("/api/productos/buscar", async (req, res) => {
  const { q } = req.body;

  if (!q || q.trim().length < 2) {
    return errorRes(res, 400, "El término de búsqueda debe tener al menos 2 caracteres");
  }

  try {
    const sql = `
      SELECT
        pr.id_productos,
        pr.nombre,
        pr.descripcion,
        pr.modelo,
        pr.cantidad,
        pr.num_serie,
        p.nombre  AS plantel,
        d.nombre  AS departamento
      FROM productos pr
      INNER JOIN planteles     p ON pr.id_plantel      = p.id_plantel
      INNER JOIN departamento d ON pr.id_departamento = d.id_departamento
      WHERE
        pr.nombre    ILIKE $1 OR
        pr.modelo    ILIKE $1 OR
        pr.num_serie ILIKE $1
      ORDER BY pr.nombre ASC
    `;
    const result = await db.query(sql, [`%${q.trim()}%`]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron productos con ese criterio" });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("POST /api/productos/buscar:", err);
    return errorRes(res, 500, "Error al buscar productos", err.message);
  }
});

router.post("/api/departamentos", async (req, res) => {
    const { nombre, descripcion, id_plantel } = req.body
    if (!nombre || !descripcion || !id_plantel) {
        return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }
    try {
        const sql = `
      INSERT INTO departamento (nombre, descripcion, id_plantel)
      VALUES ($1,$2,$3)
      RETURNING *
    `;
        const result = await db.query(sql, [nombre, descripcion, parseInt(id_plantel)]);

        res.status(201).json({
            mensaje: "Departamento creado correctamente",
            departamento: result.rows[0]
        });
    } catch (error) {

        console.error("Error al crear departamento:", error);

        res.status(500).json({
            mensaje: "Error al crear departamento"
        });

    }

})

router.get("/api/departamentos", async (req, res) => {
  try {
    const sql = "SELECT id_departamento, nombre, descripcion, id_plantel FROM departamento ORDER BY nombre";
    const result = await db.query(sql);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return res.status(500).json({ mensaje: "Error al consultar los departamentos" });
  }
});

// GET departamentos filtrados por plantel (opcional pero recomendado)
router.get("/api/departamentos/:id_plantel", async (req, res) => {
  try {
    const { id_plantel } = req.params;
    const sql = "SELECT id_departamento, nombre, descripcion, id_plantel FROM departamento WHERE id_plantel = $1 ORDER BY nombre";
    const result = await db.query(sql, [parseInt(id_plantel)]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return res.status(500).json({ mensaje: "Error al consultar los departamentos" });
  }
});

router.post("/api/registros", async (req, res) => {
  const { tipo, nota, id_departamento, id_plantel, id_usuario, productos } = req.body;

  if (!tipo || !id_departamento || !id_plantel || !id_usuario || !productos?.length) {
    return res.status(400).json({ mensaje: "Faltan campos requeridos" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const fecha = new Date().toISOString().split("T")[0];
    const sqlRegistro = `
      INSERT INTO registro (fecha, tipo, nota, id_departamento, id_plantel, id_usuario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_registro
    `;
    const resRegistro = await client.query(sqlRegistro, [
      fecha, tipo, nota || null,
      parseInt(id_departamento), parseInt(id_plantel), parseInt(id_usuario)
    ]);
    const id_registro = resRegistro.rows[0].id_registro;

    for (const p of productos) {
      await client.query(
        `INSERT INTO registro_productos (cantidad, id_productos, id_registro)
         VALUES ($1, $2, $3)`,
        [parseInt(p.cantidad), parseInt(p.id_productos), id_registro]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Registro creado correctamente", id_registro });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear registro:", error);
    res.status(500).json({ mensaje: "Error al crear registro" });
  } finally {
    client.release();
  }
});

// ── GET /api/registros ───────────────────────────────────────
router.get("/api/registros", async (req, res) => {
  const id_plantel = req.headers['x-plantel'];
  if (!id_plantel) return res.status(400).json({ mensaje: "Header x-plantel requerido" });

  try {
    const sql = `
      SELECT
        r.id_registro,
        r.fecha,
        r.tipo,
        r.nota,
        u.nombre       AS usuario,
        d.nombre       AS departamento,
        p.nombre       AS plantel,
        COUNT(rp.id_registro_productos) AS total_productos
      FROM registro r
      LEFT JOIN usuarios    u ON u.id_usuario    = r.id_usuario
      LEFT JOIN departamento d ON d.id_departamento = r.id_departamento
      LEFT JOIN planteles    p ON p.id_plantel      = r.id_plantel
      LEFT JOIN registro_productos rp ON rp.id_registro = r.id_registro
      WHERE r.id_plantel = $1
      GROUP BY r.id_registro, u.nombre, d.nombre, p.nombre
      ORDER BY r.id_registro DESC
    `;
    const result = await db.query(sql, [parseInt(id_plantel)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener registros:", error);
    res.status(500).json({ mensaje: "Error al obtener registros" });
  }
});

// ── GET /api/registros/detalle ───────────────────────────────
router.get("/api/registros/detalle", async (req, res) => {
  const id_registro = req.headers['x-registro'];
  if (!id_registro) return res.status(400).json({ mensaje: "Header x-registro requerido" });

  try {
    const sql = `
      SELECT
        rp.id_registro_productos,
        rp.cantidad,
        pr.nombre      AS producto,
        pr.modelo,
        pr.num_serie,
        pr.descripcion
      FROM registro_productos rp
      JOIN productos pr ON pr.id_productos = rp.id_productos
      WHERE rp.id_registro = $1
      ORDER BY pr.nombre
    `;
    const result = await db.query(sql, [parseInt(id_registro)]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ mensaje: "Error al obtener detalle del registro" });
  }
});

module.exports = router;

