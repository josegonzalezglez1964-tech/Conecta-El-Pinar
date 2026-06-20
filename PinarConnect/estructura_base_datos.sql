-- TABLA 1: MERCADILLO DE FAVORES (Ya la tienes creada)
CREATE TABLE favores (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('PIDE', 'OFRECE')),
    zona VARCHAR(20) CHECK (zona IN ('Taibique', 'Las Casas', 'La Restinga')),
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(15) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'COMPLETADO', 'OCULTO'))
);

-- TABLA 2: MENTIDERO DIGITAL (Copia y pega esto justo debajo en tu archivo)
CREATE TABLE mentidero (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_moderacion VARCHAR(20) DEFAULT 'APROBADO' CHECK (
        estado_moderacion IN ('APROBADO', 'REPORTADO', 'BLOQUEADO')
    ),
    contador_reportes INT DEFAULT 0
);