USE SisVetDB;
GO

-- 1. Limpiar datos de tablas operacionales en el orden correcto de dependencias
DELETE FROM pago;                 -- depende de cita
DELETE FROM mascota_vacuna;       -- depende de mascota, vacuna, veterinario
DELETE FROM historial_medicamento; -- depende de historial_clinico
DELETE FROM archivo_clinico;      -- depende de historial_clinico
DELETE FROM historial_clinico;    -- depende de mascota, veterinario
DELETE FROM cita_estado_historial; -- depende de cita
DELETE FROM cita;                 -- depende de mascota, veterinario, servicio
DELETE FROM horario_veterinario;   -- depende de veterinario
DELETE FROM veterinario;          -- depende de especialidad, tipo_documento
DELETE FROM mascota;              -- depende de cliente, raza
DELETE FROM cliente;              -- depende de tipo_documento
DELETE FROM raza;                 -- depende de especie
DELETE FROM log_auditoria;        -- independiente
DELETE FROM notificacion;         -- depende de usuario

-- 2. Reiniciar semillas IDENTITY de las tablas operacionales
DBCC CHECKIDENT ('pago', RESEED, 0);
DBCC CHECKIDENT ('mascota_vacuna', RESEED, 0);
DBCC CHECKIDENT ('historial_medicamento', RESEED, 0);
DBCC CHECKIDENT ('archivo_clinico', RESEED, 0);
DBCC CHECKIDENT ('historial_clinico', RESEED, 0);
DBCC CHECKIDENT ('cita_estado_historial', RESEED, 0);
DBCC CHECKIDENT ('cita', RESEED, 0);
DBCC CHECKIDENT ('horario_veterinario', RESEED, 0);
DBCC CHECKIDENT ('veterinario', RESEED, 0);
DBCC CHECKIDENT ('mascota', RESEED, 0);
DBCC CHECKIDENT ('cliente', RESEED, 0);
DBCC CHECKIDENT ('raza', RESEED, 0);
DBCC CHECKIDENT ('log_auditoria', RESEED, 0);
DBCC CHECKIDENT ('notificacion', RESEED, 0);

-- 3. Insertar Razas
INSERT INTO raza (id_especie, nombre) VALUES
(1, 'Golden Retriever'),
(1, 'Pastor Alemán'),
(1, 'Poodle'),
(1, 'Bulldog Francés'),
(1, 'Chihuahua'),
(1, 'Beagle'),
(1, 'Schnauzer'),
(2, 'Siamés'),
(2, 'Persa'),
(2, 'Angora'),
(2, 'Bengala'),
(2, 'Criollo / Mestizo'),
(3, 'Loro Cabeza Azul'),
(4, 'Cabeza de León');

-- 4. Insertar Veterinarios
INSERT INTO veterinario (id_especialidad, id_tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, telefono, correo, numero_colegiatura, direccion, estado) VALUES
(2, 1, '44556677', 'Alejandro', 'Toledo', 'Mendoza', '987654321', 'alejandro.toledo@vetcare.pe', 'CMVP 7584', 'Av. Los Libertadores 120, San Isidro', 1),
(3, 1, '44556678', 'Beatriz', 'Valdivia', 'Ponce', '987654322', 'beatriz.valdivia@vetcare.pe', 'CMVP 8122', 'Calle Las Orquídeas 340, Miraflores', 1),
(1, 1, '44556679', 'Carlos', 'Mendoza', 'Ruiz', '987654323', 'carlos.mendoza@vetcare.pe', 'CMVP 9210', 'Av. Javier Prado Este 1500, San Borja', 1),
(4, 1, '44556680', 'Diana', 'Torres', 'Rojas', '987654324', 'diana.torres@vetcare.pe', 'CMVP 9540', 'Jr. Cañete 450, Santiago de Surco', 1);

-- 5. Insertar Horarios de Veterinarios
INSERT INTO horario_veterinario (id_veterinario, dia_semana, hora_inicio, hora_fin, estado) VALUES
(1, 'LUNES', '08:00:00', '14:00:00', 1),
(1, 'MIERCOLES', '08:00:00', '14:00:00', 1),
(1, 'VIERNES', '08:00:00', '14:00:00', 1),
(2, 'MARTES', '09:00:00', '17:00:00', 1),
(2, 'JUEVES', '09:00:00', '17:00:00', 1),
(2, 'SABADO', '09:00:00', '17:00:00', 1),
(3, 'LUNES', '14:00:00', '20:00:00', 1),
(3, 'MARTES', '14:00:00', '20:00:00', 1),
(3, 'MIERCOLES', '14:00:00', '20:00:00', 1),
(3, 'JUEVES', '14:00:00', '20:00:00', 1),
(3, 'VIERNES', '14:00:00', '20:00:00', 1),
(4, 'SABADO', '08:00:00', '18:00:00', 1),
(4, 'DOMINGO', '08:00:00', '18:00:00', 1);

-- 6. Insertar Clientes
INSERT INTO cliente (id_tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, telefono, correo, direccion, estado) VALUES
(1, '71234561', 'Juan', 'Pérez', 'Gómez', '987654321', 'juan.perez@gmail.com', 'Av. Larco 123, Miraflores', 1),
(1, '71234562', 'María', 'Rodríguez', 'Soto', '987654322', 'maria.rodriguez@gmail.com', 'Jr. Carabaya 456, Lima', 1),
(1, '71234563', 'Carlos', 'Fuentes', 'Ortiz', '987654323', 'carlos.fuentes@gmail.com', 'Av. Javier Prado 789, San Isidro', 1),
(1, '71234564', 'Ana', 'Gómez', 'Valera', '987654324', 'ana.gomez@gmail.com', 'Calle Las Flores 321, Surco', 1),
(1, '71234565', 'Luis', 'Torres', 'Paredes', '987654325', 'luis.torres@gmail.com', 'Av. Arequipa 1550, Lince', 1),
(1, '71234566', 'Patricia', 'Rivas', 'Loli', '987654326', 'patricia.rivas@gmail.com', 'Jr. Junín 780, Magdalena', 1),
(1, '71234567', 'Roberto', 'Castro', 'Vaca', '987654327', 'roberto.castro@gmail.com', 'Av. El Sol 410, Barranco', 1),
(1, '71234568', 'Sofía', 'Beltrán', 'Ramos', '987654328', 'sofia.beltran@gmail.com', 'Av. La Marina 2200, San Miguel', 1),
(1, '71234569', 'David', 'Ortiz', 'Jara', '987654329', 'david.ortiz@gmail.com', 'Jr. Trujillo 150, Rímac', 1),
(1, '71234570', 'Elena', 'Vargas', 'Cruz', '987654330', 'elena.vargas@gmail.com', 'Av. Primavera 900, San Borja', 1);

-- 7. Insertar Mascotas
INSERT INTO mascota (id_cliente, id_raza, nombre, sexo, color, peso, fecha_nacimiento, observaciones, estado) VALUES
(1, 1, 'Rocky', 'M', 'Dorado', 30.50, '2021-03-15', 'Alergia al pollo, muy dócil.', 1),
(2, 8, 'Luna', 'F', 'Gris point', 4.20, '2022-06-20', 'Suele estresarse rápido.', 1),
(3, 3, 'Toby', 'M', 'Blanco', 6.80, '2023-01-10', 'Le teme a los ruidos fuertes.', 1),
(4, 12, 'Cleo', 'F', 'Atigrado', 3.80, '2020-11-05', 'Paciente excelente.', 1),
(5, 2, 'Max', 'M', 'Negro y Fuego', 35.00, '2019-08-12', 'Controlar por displasia de cadera.', 1),
(6, 5, 'Lola', 'F', 'Arena', 2.50, '2024-02-14', 'Muy pequeña, manejar con cuidado.', 1),
(7, 4, 'Bruno', 'M', 'Vaquita', 12.00, '2022-10-30', 'Dificultad respiratoria leve.', 1),
(8, 9, 'Mia', 'F', 'Blanco puro', 4.50, '2021-05-18', 'Llora al revisar orejas.', 1),
(9, 6, 'Lucas', 'M', 'Tricolor', 15.20, '2023-07-22', 'Hiperactivo.', 1),
(10, 7, 'Kira', 'F', 'Sal y Pimienta', 8.40, '2020-04-01', 'Control de otitis.', 1),
(2, 11, 'Simba', 'M', 'Leopardo', 5.00, '2023-09-01', 'Gato muy inquieto.', 1),
(4, 3, 'Coco', 'M', 'Champagne', 7.10, '2024-01-05', 'Doble dosis antirrábica.', 1);

-- 8. Insertar Citas (historial y futuras)
INSERT INTO cita (id_mascota, id_veterinario, id_servicio, id_estado_cita, fecha_hora, motivo, observaciones) VALUES
(1, 3, 1, 2, '2026-06-08 09:00:00', 'Chequeo general de orejas', 'Otitis leve detectada, se receta gotas limpiadoras.'),
(2, 2, 3, 2, '2026-06-09 10:30:00', 'Desparasitación trimestral', 'Aplicado pipeta Broadline antiparasitaria.'),
(3, 1, 4, 2, '2026-06-09 14:00:00', 'Esterilización programada', 'Cirugía de castración exitosa sin complicaciones.'),
(4, 3, 1, 2, '2026-06-10 11:00:00', 'Estornudos continuos', 'Gripe felina leve. Reposo e hidratación por 5 días.'),
(5, 4, 1, 3, '2026-06-10 16:00:00', 'Control de vacunas', 'Cliente cancela por problemas personales.'),
(6, 3, 2, 2, '2026-06-11 08:30:00', 'Vacuna Antirrábica', 'Colocada vacuna antirrábica Zoetis. Sin reacciones.'),
(7, 1, 5, 1, '2026-06-11 11:00:00', 'Profilaxis dental', 'Agendado hoy, paciente en ayunas.'),
(8, 2, 1, 1, '2026-06-11 15:30:00', 'Revisión por caída de pelo', 'Agendado hoy, sospecha de dermatitis por pulgas.'),
(9, 3, 6, 1, '2026-06-12 09:30:00', 'Baño y corte de verano', 'Reservado para mañana.'),
(10, 4, 1, 4, '2026-06-12 12:00:00', 'Tos de perrera', 'Cita reprogramada para el lunes por disponibilidad del dueño.'),
(11, 3, 3, 1, '2026-06-13 10:00:00', 'Control antiparasitario', 'Cita reservada.'),
(12, 1, 4, 1, '2026-06-15 09:00:00', 'Operación hernia', 'Paciente requiere exámenes pre-quirúrgicos completos.'),
(1, 3, 2, 1, '2026-06-16 11:30:00', 'Refuerzo séxtuple', 'Cita reservada.'),
(3, 2, 1, 1, '2026-06-18 16:00:00', 'Control post-operatorio', 'Revisión de puntos de cirugía de castración.'),
(5, 4, 1, 1, '2026-06-20 10:30:00', 'Control cardiológico', 'Control preventivo anual de soplo cardíaco.');

-- 9. Insertar Pagos
INSERT INTO pago (id_cita, monto, metodo_pago, fecha_pago, numero_operacion, observaciones, estado) VALUES
(1, 50.00, 'EFECTIVO', '2026-06-08 09:35:00', 'OP-1001', 'Consulta general pagada.', 'PAGADO'),
(2, 30.00, 'YAPE',     '2026-06-09 10:45:00', 'OP-1002', 'Pago por Yape de desparasitación.', 'PAGADO'),
(3, 300.00, 'TARJETA', '2026-06-09 15:30:00', 'OP-1003', 'Pago Visa por cirugía de castración.', 'PAGADO'),
(4, 50.00, 'PLIN',     '2026-06-10 11:40:00', 'OP-1004', 'Pago por Plin.', 'PAGADO'),
(6, 40.00, 'EFECTIVO', '2026-06-11 08:50:00', 'OP-1005', 'Vacuna antirrábica pagada.', 'PAGADO');

-- 10. Insertar Vacunación de Mascotas (incluye 3 vacunas VENCIDAS para disparar las alertas)
INSERT INTO mascota_vacuna (id_mascota, id_vacuna, id_veterinario, fecha_aplicacion, proxima_dosis, lote, observaciones) VALUES
(1, 2, 3, '2026-05-27', '2026-06-12', 'L-SEXT-9988', 'Aplicada dosis de refuerzo anual.'),
(2, 3, 2, '2026-05-28', '2026-06-15', 'L-TRIP-1122', 'Primera dosis del año.'),
(6, 1, 3, '2026-06-11', '2027-06-11', 'L-RAB-4455', 'Refuerzo de rabia colocado hoy.'),
(10, 4, 4, '2026-05-15', '2026-06-25', 'L-LEP-2023', 'Control trimestral contra Leptospira.'),
(12, 5, 1, '2026-05-30', '2026-06-13', 'L-BOR-0077', 'Refuerzo nasal para traqueobronquitis.'),
-- Alertas de Refuerzos Vencidos (proxima_dosis en el pasado)
(3, 2, 1, '2025-05-20', '2026-05-20', 'L-SEXT-8811', 'Refuerzo anual vencido. Requiere regularización.'),
(5, 1, 4, '2025-06-01', '2026-06-01', 'L-RAB-7722', 'Vacuna antirrábica anual vencida hace 10 días.'),
(8, 3, 2, '2025-06-05', '2026-06-05', 'L-TRIP-6633', 'Triple felina vencida. Notificar a propietario.');

-- 11. Insertar Historial Clínico
INSERT INTO historial_clinico (id_mascota, id_veterinario, id_cita, fecha_atencion, temperatura, peso, diagnostico, tratamiento, observaciones, estado) VALUES
(1, 3, 1, '2026-06-08 09:30:00', 38.50, 30.50, 'Otitis externa leve en oído derecho.', 'Limpieza diaria con solución ótica y gotas de Enrofloxacina c/12h por 7 días.', 'Paciente cooperador. Se recomienda control en una semana.', 1),
(2, 2, 2, '2026-06-09 10:45:00', 38.20, 4.20, 'Control de desparasitación trimestral y peso.', 'Broadline pipeta aplicado en consulta. Siguiente dosis en 3 meses.', 'Gato con leve sobrepeso. Controlar ración de comida.', 1),
(3, 1, 3, '2026-06-09 15:30:00', 39.00, 6.80, 'Esterilización quirúrgica electiva (orquiectomía).', 'Castración sin complicaciones. Amoxicilina 150mg c/12h por 5 días, Meloxicam c/24h por 3 días.', 'Uso obligatorio de collar isabelino. Retirar puntos en 10 días.', 1),
(4, 3, 4, '2026-06-10 11:30:00', 38.70, 3.80, 'Rinotraqueítis viral felina leve (gripe felina).', 'Inhalaciones con suero fisiológico, Amoxicilina suspensión c/12h por 5 días, soporte nutricional.', 'Aislar de otros gatos. Control de hidratación.', 1),
(1, 3, NULL, '2025-11-15 10:00:00', 38.40, 28.00, 'Vacuna séxtuple de refuerzo anual.', 'Colocación de vacuna séxtuple canina MSD.', 'Sin reacciones adversas post-vacuna.', 1);

-- 12. Insertar Detalle de Medicamentos Recetados
INSERT INTO historial_medicamento (id_historial, id_medicamento, dosis, frecuencia, duracion, observaciones) VALUES
(3, 1, '150mg', 'Cada 12 horas', '5 días', 'Administrar vía oral con alimento.'),
(3, 2, '1.5ml', 'Cada 24 horas', '3 días', 'Antiinflamatorio y analgésico post-quirúrgico.'),
(1, 4, '1 tableta (50mg)', 'Cada 12 horas', '7 días', 'Antibiótico para otitis bacteriana.'),
(4, 1, '0.8ml suspensión', 'Cada 12 horas', '5 días', 'Antibiótico de amplio espectro para felinos.');

-- 13. Insertar Logs de Auditoría (Para poblar el visor de auditoría del administrador)
INSERT INTO log_auditoria (usuario, modulo, accion, descripcion, ip_cliente, fecha_evento, estado) VALUES
('admin', 'SEGURIDAD', 'LOGIN', 'Inicio de sesión exitoso en el sistema web', '192.168.1.50', '2026-06-11 08:00:00', 'EXITOSO'),
('recep', 'SEGURIDAD', 'LOGIN', 'Inicio de sesión exitoso en el sistema web', '192.168.1.52', '2026-06-11 08:15:00', 'EXITOSO'),
('recep', 'CLIENTES', 'REGISTRAR', 'Registro de nuevo cliente: Sofía Beltrán (DNI 71234568)', '192.168.1.52', '2026-06-11 08:20:00', 'EXITOSO'),
('recep', 'MASCOTAS', 'REGISTRAR', 'Registro de nueva mascota: Lola (Raza: Chihuahua) asignada a Sofía Beltrán', '192.168.1.52', '2026-06-11 08:25:00', 'EXITOSO'),
('vet', 'SEGURIDAD', 'LOGIN', 'Inicio de sesión exitoso en el sistema web', '192.168.1.60', '2026-06-11 08:30:00', 'EXITOSO'),
('vet', 'CITAS', 'ATENDER', 'Atención registrada para la cita #6 (Mascota: Lola - Vacuna Antirrábica)', '192.168.1.60', '2026-06-11 08:50:00', 'EXITOSO'),
('recep', 'PAGOS', 'REGISTRAR', 'Registro de pago OP-1005 por monto S/ 40.00 asociado a la cita #6', '192.168.1.52', '2026-06-11 08:52:00', 'EXITOSO'),
('admin', 'VETERINARIOS', 'ACTUALIZAR', 'Actualización de datos del Dr. Carlos Mendoza', '192.168.1.50', '2026-06-11 09:15:00', 'EXITOSO'),
('recep', 'CITAS', 'REGISTRAR', 'Registro de nueva cita para mascota Rocky con Dr. Carlos Mendoza', '192.168.1.52', '2026-06-11 09:30:00', 'EXITOSO');

-- 14. Insertar Notificaciones (Notificaciones simuladas para buzón)
INSERT INTO notificacion (id_usuario, titulo, mensaje, tipo, leido, fecha_creacion, fecha_lectura) VALUES
(3, 'Vacuna próxima a vencer', 'La mascota "Rocky" tiene programada la próxima dosis de la vacuna "Triple Canina" para el 12/06/2026.', 'vacuna', 0, '2026-06-11 08:00:00', NULL),
(3, 'Cita programada para mañana', 'Cita médica de la mascota "Luna" programada para mañana a las 10:00 AM con el Dr. Carlos Mendoza.', 'cita', 0, '2026-06-11 08:05:00', NULL),
(3, 'Nueva mascota registrada', 'Se ha registrado exitosamente a la mascota "Coco" (Raza: Poodle). Propietario: Ana Gómez.', 'mascota', 0, '2026-06-11 08:10:00', NULL),
(1, 'Intento de Acceso Anómalo', 'Se detectó un intento de inicio de sesión fallido para el usuario "admin" desde la IP 190.235.10.8.', 'seguridad', 0, '2026-06-11 07:30:00', NULL),
(2, 'Nueva Cita Asignada', 'Se le ha asignado una nueva cita de urgencia para hoy a las 11:30 AM (Mascota: Bruno, Motivo: Profilaxis dental).', 'cita', 0, '2026-06-11 08:35:00', NULL);
GO
