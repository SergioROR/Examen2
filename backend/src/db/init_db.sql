-- Planteles table
CREATE TABLE IF NOT EXISTS planteles (
    id_plantel BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen TEXT,
    es_principal BOOLEAN NOT NULL DEFAULT false
 );

 -- Usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USUARIO',
    id_plantel BIGINT REFERENCES planteles(id_plantel),
    imagen TEXT,
    esta_activo BOOLEAN NOT NULL DEFAULT true
 );

 -- Departamentos table
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_plantel BIGINT NOT NULL REFERENCES planteles(id_plantel)
);

-- Productos table
CREATE TABLE IF NOT EXISTS productos (
    id_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    modelo VARCHAR(100) NOT NULL,
    num_serie VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad > 0),
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_el TIMESTAMP NOT NULL,
    id_departamento BIGINT NOT NULL
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos(
    id_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario)
);

-- Detalles pedidos table
CREATE TABLE IF NOT EXISTS detalles_pedidos(
    id_detalle_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    id_pedido BIGINT NOT NULL REFERENCES pedidos(id_pedido),
    id_producto BIGINT NOT NULL REFERENCES productos(id_producto)
);

-- Solicitudes Productos table
CREATE TABLE IF NOT EXISTS solicitudes_productos(
    id_solicitud BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_plantel BIGINT NOT NULL REFERENCES planteles(id_plantel),
    id_producto BIGINT REFERENCES productos(id_producto)
);

-- Registros table
CREATE TABLE IF NOT EXISTS registros(
    id_registro BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    creado_el TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo VARCHAR(20),
    nota TEXT,
    id_departamento BIGINT NOT NULL REFERENCES departamentos(id_departamento),
    id_plantel BIGINT NOT NULL REFERENCES planteles(id_plantel),
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_plantel_origen BIGINT REFERENCES planteles(id_plantel)
);

-- Registros Productos table
CREATE TABLE IF NOT EXISTS registros_productos(
    id_registro_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    id_producto BIGINT NOT NULL REFERENCES productos(id_producto),
    id_registro BIGINT NOT NULL REFERENCES registros(id_registro) 
);

INSERT INTO usuarios (nombre, apellidos, correo, contraseña, rol)
VALUES ('John', 'Doe', 'admin@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');