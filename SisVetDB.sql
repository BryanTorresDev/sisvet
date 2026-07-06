-- =========================================================
--  SisVetDB - SQL Server 2022
--  Script completo de creación e inicialización
-- =========================================================

CREATE DATABASE SisVetDB;
GO

USE SisVetDB;
GO

-- =========================================================
-- PARTE 1 - USUARIOS, CLIENTES Y MASCOTAS
-- =========================================================

CREATE TABLE rol (
    id_rol          INT IDENTITY(1,1) PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL,
    descripcion     VARCHAR(200),
    estado          BIT          NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_ROL_NOMBRE UNIQUE(nombre)
);
GO

CREATE TABLE usuario (
    id_usuario      BIGINT IDENTITY(1,1) PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL,
    -- Contraseña almacenada con BCryptPasswordEncoder
    -- Ejemplo: $2a$10$7VYq...
    password        VARCHAR(255) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    estado          BIT          NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME     NOT NULL DEFAULT GETDATE(),
    ultimo_login    DATETIME     NULL,
    CONSTRAINT UQ_USUARIO_USERNAME UNIQUE(username),
    CONSTRAINT UQ_USUARIO_EMAIL    UNIQUE(email)
);
GO

CREATE TABLE usuario_rol (
    id_usuario       BIGINT   NOT NULL,
    id_rol           INT      NOT NULL,
    fecha_asignacion DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY(id_usuario, id_rol),
    CONSTRAINT FK_USUARIO_ROL_USUARIO
        FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT FK_USUARIO_ROL_ROL
        FOREIGN KEY(id_rol)     REFERENCES rol(id_rol)
);
GO

CREATE TABLE tipo_documento (
    id_tipo_documento INT IDENTITY(1,1) PRIMARY KEY,
    nombre            VARCHAR(50) NOT NULL,
    longitud          INT         NOT NULL,
    estado            BIT         NOT NULL DEFAULT 1,
    CONSTRAINT UQ_TIPO_DOCUMENTO UNIQUE(nombre)
);
GO

CREATE TABLE cliente (
    id_cliente        BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_tipo_documento INT          NOT NULL,
    numero_documento  VARCHAR(20)  NOT NULL,
    nombres           VARCHAR(100) NOT NULL,
    apellido_paterno  VARCHAR(100) NOT NULL,
    apellido_materno  VARCHAR(100) NOT NULL,
    telefono          VARCHAR(20),
    correo            VARCHAR(150),
    direccion         VARCHAR(250),
    fecha_registro    DATETIME     NOT NULL DEFAULT GETDATE(),
    estado            BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_CLIENTE_TIPO_DOCUMENTO
        FOREIGN KEY(id_tipo_documento) REFERENCES tipo_documento(id_tipo_documento),
    CONSTRAINT UQ_CLIENTE_DOCUMENTO UNIQUE(numero_documento)
);
GO

CREATE TABLE especie (
    id_especie INT IDENTITY(1,1) PRIMARY KEY,
    nombre     VARCHAR(50) NOT NULL,
    estado     BIT         NOT NULL DEFAULT 1,
    CONSTRAINT UQ_ESPECIE_NOMBRE UNIQUE(nombre)
);
GO

CREATE TABLE raza (
    id_raza    INT IDENTITY(1,1) PRIMARY KEY,
    id_especie INT          NOT NULL,
    nombre     VARCHAR(100) NOT NULL,
    estado     BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_RAZA_ESPECIE
        FOREIGN KEY(id_especie) REFERENCES especie(id_especie)
);
GO

CREATE TABLE mascota (
    id_mascota       BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_cliente       BIGINT        NOT NULL,
    id_raza          INT           NOT NULL,
    nombre           VARCHAR(100)  NOT NULL,
    sexo             CHAR(1)       NOT NULL,
    color            VARCHAR(50),
    peso             DECIMAL(8,2),
    fecha_nacimiento DATE,
    observaciones    VARCHAR(500),
    estado           BIT           NOT NULL DEFAULT 1,
    fecha_registro   DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MASCOTA_CLIENTE
        FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT FK_MASCOTA_RAZA
        FOREIGN KEY(id_raza)    REFERENCES raza(id_raza),
    CONSTRAINT CK_MASCOTA_SEXO CHECK (sexo IN ('M','F'))
);
GO

-- Índices Parte 1
CREATE INDEX IX_CLIENTE_DOCUMENTO ON cliente(numero_documento);
CREATE INDEX IX_MASCOTA_CLIENTE   ON mascota(id_cliente);
CREATE INDEX IX_RAZA_ESPECIE      ON raza(id_especie);
GO

-- Datos semilla Parte 1
INSERT INTO rol (nombre, descripcion) VALUES
('ADMINISTRADOR',  'Control total del sistema'),
('VETERINARIO',    'Atención médica'),
('RECEPCIONISTA',  'Registro y gestión de citas');
GO

INSERT INTO tipo_documento (nombre, longitud) VALUES
('DNI',       8),
('CE',       12),
('PASAPORTE',12);
GO

INSERT INTO especie (nombre) VALUES
('Perro'),
('Gato'),
('Ave'),
('Conejo');
GO


-- =========================================================
-- PARTE 2 - VETERINARIOS, SERVICIOS Y CITAS
-- =========================================================

CREATE TABLE especialidad (
    id_especialidad INT IDENTITY(1,1) PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(250),
    estado          BIT          NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_ESPECIALIDAD_NOMBRE UNIQUE(nombre)
);
GO

CREATE TABLE veterinario (
    id_veterinario      BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_especialidad     INT          NOT NULL,
    id_tipo_documento   INT          NOT NULL,
    numero_documento    VARCHAR(20)  NOT NULL,
    nombres             VARCHAR(100) NOT NULL,
    apellido_paterno    VARCHAR(100) NOT NULL,
    apellido_materno    VARCHAR(100) NOT NULL,
    telefono            VARCHAR(20),
    correo              VARCHAR(150),
    numero_colegiatura  VARCHAR(50),
    direccion           VARCHAR(250),
    estado              BIT          NOT NULL DEFAULT 1,
    fecha_registro      DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_VETERINARIO_ESPECIALIDAD
        FOREIGN KEY(id_especialidad)   REFERENCES especialidad(id_especialidad),
    CONSTRAINT FK_VETERINARIO_TIPO_DOCUMENTO
        FOREIGN KEY(id_tipo_documento) REFERENCES tipo_documento(id_tipo_documento),
    CONSTRAINT UQ_VETERINARIO_DOCUMENTO UNIQUE(numero_documento),
    CONSTRAINT UQ_VETERINARIO_CORREO    UNIQUE(correo)
);
GO

CREATE TABLE horario_veterinario (
    id_horario     BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_veterinario BIGINT      NOT NULL,
    dia_semana     VARCHAR(15) NOT NULL,
    hora_inicio    TIME        NOT NULL,
    hora_fin       TIME        NOT NULL,
    estado         BIT         NOT NULL DEFAULT 1,
    CONSTRAINT FK_HORARIO_VETERINARIO
        FOREIGN KEY(id_veterinario) REFERENCES veterinario(id_veterinario),
    CONSTRAINT CK_DIA_SEMANA CHECK (
        dia_semana IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO')
    ),
    CONSTRAINT CK_HORARIO_VALIDO CHECK (hora_inicio < hora_fin)
);
GO

CREATE TABLE servicio (
    id_servicio       INT IDENTITY(1,1) PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    descripcion       VARCHAR(500),
    precio            DECIMAL(10,2) NOT NULL,
    duracion_minutos  INT           NOT NULL,
    estado            BIT           NOT NULL DEFAULT 1,
    fecha_creacion    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_SERVICIO_NOMBRE UNIQUE(nombre),
    CONSTRAINT CK_SERVICIO_PRECIO CHECK(precio >= 0)
);
GO

CREATE TABLE estado_cita (
    id_estado_cita INT IDENTITY(1,1) PRIMARY KEY,
    nombre         VARCHAR(50)  NOT NULL,
    descripcion    VARCHAR(250),
    CONSTRAINT UQ_ESTADO_CITA UNIQUE(nombre)
);
GO

CREATE TABLE cita (
    id_cita        BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_mascota     BIGINT       NOT NULL,
    id_veterinario BIGINT       NOT NULL,
    id_servicio    INT          NOT NULL,
    id_estado_cita INT          NOT NULL,
    fecha_hora     DATETIME     NOT NULL,
    motivo         VARCHAR(500),
    observaciones  VARCHAR(500),
    fecha_registro DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CITA_MASCOTA
        FOREIGN KEY(id_mascota)     REFERENCES mascota(id_mascota),
    CONSTRAINT FK_CITA_VETERINARIO
        FOREIGN KEY(id_veterinario) REFERENCES veterinario(id_veterinario),
    CONSTRAINT FK_CITA_SERVICIO
        FOREIGN KEY(id_servicio)    REFERENCES servicio(id_servicio),
    CONSTRAINT FK_CITA_ESTADO
        FOREIGN KEY(id_estado_cita) REFERENCES estado_cita(id_estado_cita)
);
GO

CREATE TABLE cita_estado_historial (
    id_historial_estado BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_cita             BIGINT       NOT NULL,
    id_estado_cita      INT          NOT NULL,
    observacion         VARCHAR(500),
    fecha_cambio        DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CEH_CITA
        FOREIGN KEY(id_cita)        REFERENCES cita(id_cita),
    CONSTRAINT FK_CEH_ESTADO
        FOREIGN KEY(id_estado_cita) REFERENCES estado_cita(id_estado_cita)
);
GO

-- Índices Parte 2
CREATE INDEX IX_VETERINARIO_DOCUMENTO   ON veterinario(numero_documento);
CREATE INDEX IX_VETERINARIO_ESPECIALIDAD ON veterinario(id_especialidad);
CREATE INDEX IX_HORARIO_VETERINARIO     ON horario_veterinario(id_veterinario);
CREATE INDEX IX_CITA_MASCOTA            ON cita(id_mascota);
CREATE INDEX IX_CITA_VETERINARIO        ON cita(id_veterinario);
CREATE INDEX IX_CITA_FECHA              ON cita(fecha_hora);
CREATE INDEX IX_HISTORIAL_ESTADO_CITA   ON cita_estado_historial(id_cita);
GO

-- Datos semilla Parte 2
INSERT INTO especialidad (nombre, descripcion) VALUES
('Medicina General', 'Atención veterinaria general'),
('Cirugía',          'Procedimientos quirúrgicos'),
('Dermatología',     'Problemas dermatológicos'),
('Odontología',      'Salud bucal animal'),
('Traumatología',    'Lesiones y fracturas');
GO

INSERT INTO estado_cita (nombre, descripcion) VALUES
('PROGRAMADA',   'Cita registrada'),
('ATENDIDA',     'Cita completada'),
('CANCELADA',    'Cita cancelada'),
('REPROGRAMADA', 'Cita reprogramada');
GO

INSERT INTO servicio (nombre, descripcion, precio, duracion_minutos) VALUES
('Consulta General', 'Evaluación médica general',              50.00,  30),
('Vacunación',       'Aplicación de vacunas',                  35.00,  20),
('Desparasitación',  'Control antiparasitario',                40.00,  20),
('Radiografía',      'Servicio de diagnóstico por imágenes',  120.00,  45),
('Ecografía',        'Servicio de ecografía veterinaria',     150.00,  45),
('Cirugía Menor',    'Procedimiento quirúrgico menor',        250.00,  90);
GO


-- =========================================================
-- PARTE 3 - HISTORIAL CLÍNICO Y MEDICAMENTOS
-- =========================================================

CREATE TABLE historial_clinico (
    id_historial   BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_mascota     BIGINT       NOT NULL,
    id_veterinario BIGINT       NOT NULL,
    id_cita        BIGINT       NULL,
    fecha_atencion DATETIME     NOT NULL DEFAULT GETDATE(),
    temperatura    DECIMAL(5,2) NULL,
    peso           DECIMAL(8,2) NULL,
    diagnostico    VARCHAR(5000) NOT NULL,
    tratamiento    VARCHAR(5000),
    observaciones  VARCHAR(5000),
    estado         BIT          NOT NULL DEFAULT 1,
    fecha_registro DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_HISTORIAL_MASCOTA
        FOREIGN KEY(id_mascota)     REFERENCES mascota(id_mascota),
    CONSTRAINT FK_HISTORIAL_VETERINARIO
        FOREIGN KEY(id_veterinario) REFERENCES veterinario(id_veterinario),
    CONSTRAINT FK_HISTORIAL_CITA
        FOREIGN KEY(id_cita)        REFERENCES cita(id_cita)
);
GO

CREATE TABLE archivo_clinico (
    id_archivo      BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_historial    BIGINT         NOT NULL,
    nombre_archivo  VARCHAR(255)   NOT NULL,
    nombre_original VARCHAR(255)   NOT NULL,
    ruta_archivo    VARCHAR(500)   NOT NULL,
    extension       VARCHAR(20)    NOT NULL,
    tamano_kb       DECIMAL(10,2),
    fecha_subida    DATETIME       NOT NULL DEFAULT GETDATE(),
    estado          BIT            NOT NULL DEFAULT 1,
    CONSTRAINT FK_ARCHIVO_HISTORIAL
        FOREIGN KEY(id_historial) REFERENCES historial_clinico(id_historial)
);
GO

CREATE TABLE medicamento (
    id_medicamento INT IDENTITY(1,1) PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    VARCHAR(500),
    presentacion   VARCHAR(100),
    fabricante     VARCHAR(150),
    estado         BIT          NOT NULL DEFAULT 1,
    fecha_creacion DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_MEDICAMENTO_NOMBRE UNIQUE(nombre)
);
GO

CREATE TABLE historial_medicamento (
    id_historial_medicamento BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_historial             BIGINT       NOT NULL,
    id_medicamento           INT          NOT NULL,
    dosis                    VARCHAR(100) NOT NULL,
    frecuencia               VARCHAR(100) NOT NULL,
    duracion                 VARCHAR(100),
    observaciones            VARCHAR(500),
    fecha_registro           DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_HM_HISTORIAL
        FOREIGN KEY(id_historial)   REFERENCES historial_clinico(id_historial),
    CONSTRAINT FK_HM_MEDICAMENTO
        FOREIGN KEY(id_medicamento) REFERENCES medicamento(id_medicamento)
);
GO

-- Índices Parte 3
CREATE INDEX IX_HISTORIAL_MASCOTA     ON historial_clinico(id_mascota);
CREATE INDEX IX_HISTORIAL_VETERINARIO ON historial_clinico(id_veterinario);
CREATE INDEX IX_HISTORIAL_FECHA       ON historial_clinico(fecha_atencion);
CREATE INDEX IX_ARCHIVO_HISTORIAL     ON archivo_clinico(id_historial);
CREATE INDEX IX_HM_HISTORIAL          ON historial_medicamento(id_historial);
CREATE INDEX IX_HM_MEDICAMENTO        ON historial_medicamento(id_medicamento);
GO

-- Datos semilla Parte 3
INSERT INTO medicamento (nombre, descripcion, presentacion, fabricante) VALUES
('Amoxicilina',   'Antibiótico de amplio espectro',          'Tabletas',         'Zoetis'),
('Meloxicam',     'Antiinflamatorio no esteroideo',           'Suspensión Oral',  'Bayer'),
('Ivermectina',   'Antiparasitario',                          'Inyectable',       'Agrovet Market'),
('Enrofloxacina', 'Antibiótico veterinario',                  'Tabletas',         'Merial'),
('Prednisolona',  'Corticoide antiinflamatorio',              'Tabletas',         'MSD Animal Health');
GO


-- =========================================================
-- PARTE 4 - VACUNACIÓN, PAGOS Y AUDITORÍA
-- =========================================================

CREATE TABLE vacuna (
    id_vacuna         INT IDENTITY(1,1) PRIMARY KEY,
    nombre            VARCHAR(150) NOT NULL,
    descripcion       VARCHAR(500),
    fabricante        VARCHAR(150),
    dosis_recomendada VARCHAR(100),
    estado            BIT          NOT NULL DEFAULT 1,
    fecha_creacion    DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_VACUNA_NOMBRE UNIQUE(nombre)
);
GO

CREATE TABLE mascota_vacuna (
    id_mascota_vacuna BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_mascota        BIGINT       NOT NULL,
    id_vacuna         INT          NOT NULL,
    id_veterinario    BIGINT       NOT NULL,
    fecha_aplicacion  DATE         NOT NULL,
    proxima_dosis     DATE         NULL,
    lote              VARCHAR(100),
    observaciones     VARCHAR(500),
    fecha_registro    DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MASCOTA_VACUNA_MASCOTA
        FOREIGN KEY(id_mascota)     REFERENCES mascota(id_mascota),
    CONSTRAINT FK_MASCOTA_VACUNA_VACUNA
        FOREIGN KEY(id_vacuna)      REFERENCES vacuna(id_vacuna),
    CONSTRAINT FK_MASCOTA_VACUNA_VETERINARIO
        FOREIGN KEY(id_veterinario) REFERENCES veterinario(id_veterinario)
);
GO

CREATE TABLE pago (
    id_pago          BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_cita          BIGINT        NOT NULL,
    monto            DECIMAL(10,2) NOT NULL,
    metodo_pago      VARCHAR(30)   NOT NULL,
    fecha_pago       DATETIME      NOT NULL DEFAULT GETDATE(),
    numero_operacion VARCHAR(100),
    observaciones    VARCHAR(500),
    estado           VARCHAR(30)   NOT NULL DEFAULT 'PAGADO',
    CONSTRAINT FK_PAGO_CITA
        FOREIGN KEY(id_cita) REFERENCES cita(id_cita),
    CONSTRAINT CK_PAGO_MONTO   CHECK(monto > 0),
    CONSTRAINT CK_PAGO_METODO  CHECK(
        metodo_pago IN ('EFECTIVO','YAPE','PLIN','TARJETA','TRANSFERENCIA')
    )
);
GO

CREATE TABLE log_auditoria (
    id_log       BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario      VARCHAR(100)  NOT NULL,
    modulo       VARCHAR(100)  NOT NULL,
    accion       VARCHAR(100)  NOT NULL,
    descripcion  VARCHAR(1000),
    ip_cliente   VARCHAR(50),
    fecha_evento DATETIME      NOT NULL DEFAULT GETDATE(),
    estado       VARCHAR(50)   NOT NULL DEFAULT 'EXITOSO'
);
GO

-- Índices Parte 4
CREATE INDEX IX_MASCOTA_VACUNA_MASCOTA     ON mascota_vacuna(id_mascota);
CREATE INDEX IX_MASCOTA_VACUNA_VACUNA      ON mascota_vacuna(id_vacuna);
CREATE INDEX IX_MASCOTA_VACUNA_VETERINARIO ON mascota_vacuna(id_veterinario);
CREATE INDEX IX_MASCOTA_VACUNA_FECHA       ON mascota_vacuna(fecha_aplicacion);
CREATE INDEX IX_PAGO_CITA                  ON pago(id_cita);
CREATE INDEX IX_PAGO_FECHA                 ON pago(fecha_pago);
CREATE INDEX IX_LOG_USUARIO                ON log_auditoria(usuario);
CREATE INDEX IX_LOG_MODULO                 ON log_auditoria(modulo);
CREATE INDEX IX_LOG_FECHA                  ON log_auditoria(fecha_evento);
GO

-- Datos semilla Parte 4
INSERT INTO vacuna (nombre, descripcion, fabricante, dosis_recomendada) VALUES
('Antirrábica',      'Prevención de la rabia',                             'Zoetis',               '1 dosis anual'),
('Séxtuple Canina',  'Protección contra múltiples enfermedades caninas',   'MSD Animal Health',    '1 dosis anual'),
('Triple Felina',    'Protección contra enfermedades felinas comunes',      'Boehringer Ingelheim', '1 dosis anual'),
('Leptospirosis',    'Prevención de leptospirosis',                         'Zoetis',               '1 dosis anual'),
('Bordetella',       'Prevención de tos de las perreras',                   'Bayer',                '1 dosis anual');
GO


-- =========================================================
-- PARTE 5 - INTEGRACIONES, NOTIFICACIONES Y CONFIGURACIÓN
-- =========================================================

CREATE TABLE consulta_dni (
    id_consulta      BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario       BIGINT       NOT NULL,
    dni_consultado   VARCHAR(20)  NOT NULL,
    nombres          VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    fecha_consulta   DATETIME     NOT NULL DEFAULT GETDATE(),
    proveedor        VARCHAR(50)  NOT NULL DEFAULT 'APISPERU',
    estado_consulta  VARCHAR(30)  NOT NULL,
    observacion      VARCHAR(500),
    CONSTRAINT FK_CONSULTA_DNI_USUARIO
        FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
GO

CREATE TABLE notificacion (
    id_notificacion BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario      BIGINT        NOT NULL,
    titulo          VARCHAR(200)  NOT NULL,
    mensaje         VARCHAR(1000) NOT NULL,
    tipo            VARCHAR(50)   NOT NULL,
    leido           BIT           NOT NULL DEFAULT 0,
    fecha_creacion  DATETIME      NOT NULL DEFAULT GETDATE(),
    fecha_lectura   DATETIME      NULL,
    CONSTRAINT FK_NOTIFICACION_USUARIO
        FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
GO

CREATE TABLE configuracion_empresa (
    id_configuracion  INT IDENTITY(1,1) PRIMARY KEY,
    razon_social      VARCHAR(200) NOT NULL,
    nombre_comercial  VARCHAR(200),
    ruc               VARCHAR(11),
    direccion         VARCHAR(300),
    telefono          VARCHAR(30),
    correo            VARCHAR(150),
    sitio_web         VARCHAR(200),
    logo_url          VARCHAR(500),
    moneda            VARCHAR(10)   NOT NULL DEFAULT 'PEN',
    igv               DECIMAL(5,2)  NOT NULL DEFAULT 18.00,
    fecha_actualizacion DATETIME    NOT NULL DEFAULT GETDATE()
);
GO

-- Índices Parte 5
CREATE INDEX IX_CONSULTA_DNI_USUARIO   ON consulta_dni(id_usuario);
CREATE INDEX IX_CONSULTA_DNI_FECHA     ON consulta_dni(fecha_consulta);
CREATE INDEX IX_CONSULTA_DNI_DOCUMENTO ON consulta_dni(dni_consultado);
CREATE INDEX IX_NOTIFICACION_USUARIO   ON notificacion(id_usuario);
CREATE INDEX IX_NOTIFICACION_LEIDO     ON notificacion(leido);
CREATE INDEX IX_NOTIFICACION_FECHA     ON notificacion(fecha_creacion);
GO

-- Datos semilla Parte 5
INSERT INTO configuracion_empresa
(razon_social, nombre_comercial, ruc, direccion, telefono, correo, moneda, igv)
VALUES
('SisVet Veterinaria SAC', 'SisVet', '20123456789',
 'Av. Principal 123', '999999999', 'contacto@sisvet.com', 'PEN', 18.00);
GO

-- Datos semilla: Usuarios y Roles por defecto
INSERT INTO usuario (username, password, email, estado) VALUES
('admin', '$2a$12$VCBc6kkAoHH2JmrdMeMsCuMZbm2lo1U.izxQq1X/oof/Fqx.MgssC', 'admin@sisvet.com', 1),
('vet', '$2a$12$/0u6/4EBfqAWVoAnmiNiyuSfi1ktYW.Wjnw2DY69e7VDzBVd8EYTW', 'vet@sisvet.com', 1),
('recep', '$2a$12$NqGVjW6WCjpkSyQEVTJkLOTzl7NafkWq5ENOx8h7Plgh/jiiYH.WO', 'recep@sisvet.com', 1);
GO

INSERT INTO usuario_rol (id_usuario, id_rol) VALUES
(1, 1),
(2, 2),
(3, 3);
GO

-- =========================================================
-- FIN DEL SCRIPT SisVetDB
-- =========================================================
