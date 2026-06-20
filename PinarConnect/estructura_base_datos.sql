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