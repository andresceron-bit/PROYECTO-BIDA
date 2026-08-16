-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3309
-- Tiempo de generación: 15-08-2026 a las 22:21:19
-- Versión del servidor: 8.4.7
-- Versión de PHP: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bida`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

DROP TABLE IF EXISTS `cita`;
CREATE TABLE IF NOT EXISTS `cita` (
  `id_cita` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_paciente` int NOT NULL,
  `id_odontologo` int NOT NULL,
  PRIMARY KEY (`id_cita`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id_cita`, `fecha`, `hora`, `estado`, `id_paciente`, `id_odontologo`) VALUES
(1, '2026-08-01', '08:00:00', 'Programada', 1, 1),
(2, '2026-08-02', '09:30:00', 'Atendida', 2, 2),
(3, '2026-08-03', '10:00:00', 'Cancelada', 3, 3),
(5, '2026-08-14', '09:38:00', 'Pendiente', 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultorio`
--

DROP TABLE IF EXISTS `consultorio`;
CREATE TABLE IF NOT EXISTS `consultorio` (
  `id_consultorio` int NOT NULL AUTO_INCREMENT,
  `id_numero` int NOT NULL,
  `id_local` int NOT NULL,
  `id_odontologo` int NOT NULL,
  PRIMARY KEY (`id_consultorio`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `consultorio`
--

INSERT INTO `consultorio` (`id_consultorio`, `id_numero`, `id_local`, `id_odontologo`) VALUES
(1, 4, 4, 4),
(2, 102, 2, 2),
(3, 103, 3, 3),
(6, 105, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_tratamiento`
--

DROP TABLE IF EXISTS `detalle_tratamiento`;
CREATE TABLE IF NOT EXISTS `detalle_tratamiento` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_tratamiento` int NOT NULL,
  `id_cita` int NOT NULL,
  `costo_aplicado` decimal(10,2) NOT NULL,
  `observaciones` text COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_detalle`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `detalle_tratamiento`
--

INSERT INTO `detalle_tratamiento` (`id_detalle`, `id_tratamiento`, `id_cita`, `costo_aplicado`, `observaciones`) VALUES
(1, 1, 1, 80000.00, 'Limpieza realizada sin complicaciones.'),
(2, 2, 2, 150000.00, 'Resina aplicada en molar superior.'),
(3, 3, 3, 120000.00, 'Extraccion cancelada por decision del paciente.'),
(6, 1, 1, 120000.00, 'Limpieza dental realizada correctamente.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

DROP TABLE IF EXISTS `empleado`;
CREATE TABLE IF NOT EXISTS `empleado` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `documento_identidad` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `cargo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `documento_identidad` (`documento_identidad`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `documento_identidad`, `nombre`, `apellido`, `cargo`, `correo`, `telefono`) VALUES
(1, '1061789456', 'Laura', 'Ramirez', 'Recepcionista', 'laura@bida.com', '3104567890'),
(2, '1062547893', 'Carlos', 'Muñoz', 'Auxiliar Administrativo', 'carlos@bida.com', '3115678901');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

DROP TABLE IF EXISTS `equipo`;
CREATE TABLE IF NOT EXISTS `equipo` (
  `id_equipo` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_numero` int NOT NULL,
  `fecha_mantenimiento` date NOT NULL,
  `id_local` int NOT NULL,
  `id_consultorio` int NOT NULL,
  PRIMARY KEY (`id_equipo`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id_equipo`, `tipo`, `id_numero`, `fecha_mantenimiento`, `id_local`, `id_consultorio`) VALUES
(1, 'Sillon Odontologico', 1001, '2026-06-15', 1, 1),
(2, 'Lampara LED', 1002, '2026-06-20', 2, 2),
(3, 'Comprensor Dental', 1003, '2026-06-25', 3, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

DROP TABLE IF EXISTS `factura`;
CREATE TABLE IF NOT EXISTS `factura` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `fecha_emision` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_cita` int NOT NULL,
  `id_empleado` int NOT NULL,
  `id_paciente` int NOT NULL,
  PRIMARY KEY (`id_factura`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id_factura`, `fecha_emision`, `total`, `metodo_pago`, `id_cita`, `id_empleado`, `id_paciente`) VALUES
(21, '2026-08-06 22:24:33', 950000.00, 'Tarjeta', 2, 1, 2),
(20, '2026-08-06 18:02:39', 900000.00, 'Efectivo', 2, 1, 2),
(19, '2026-08-06 22:58:12', 750000.00, 'Efectivo', 2, 1, 2),
(7, '2026-08-06 00:00:00', 100.00, 'Efectivo', 1, 0, 0),
(8, '2026-08-06 00:00:00', 240.00, 'Tarjeta', 2, 0, 0),
(9, '2026-08-06 12:34:03', 100.00, 'Efectivo', 1, 0, 0),
(10, '2026-08-06 12:40:50', 240000.00, 'Tarjeta', 2, 0, 0),
(11, '2026-08-06 12:49:26', 100.00, 'Efectivo', 2, 0, 0),
(12, '2026-08-06 12:51:21', 100.00, 'Efectivo', 2, 0, 0),
(24, '2026-08-07 10:34:24', 380000.00, 'Dinero', 2, 1, 2),
(25, '2026-08-07 10:50:12', 360000.00, 'Tarjeta', 3, 2, 3),
(26, '2026-08-13 22:01:46', 120000.00, 'Efectivo', 1, 1, 1),
(23, '2026-08-07 00:20:58', 360000.00, 'Tarjeta', 3, 2, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `local`
--

DROP TABLE IF EXISTS `local`;
CREATE TABLE IF NOT EXISTS `local` (
  `id_local` int NOT NULL AUTO_INCREMENT,
  `calle` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `numero` varchar(10) COLLATE utf8mb4_spanish_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_local`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `local`
--

INSERT INTO `local` (`id_local`, `calle`, `numero`, `ciudad`) VALUES
(1, 'Calle 5 Norte', '25-18', 'Popayan'),
(2, 'Carrera 9', '14-35', 'Cali'),
(3, 'Avenida Panamericana', '18-42', 'Pasto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `odontologo`
--

DROP TABLE IF EXISTS `odontologo`;
CREATE TABLE IF NOT EXISTS `odontologo` (
  `id_odontologo` int NOT NULL AUTO_INCREMENT,
  `numero_licencia` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `especialidad` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_odontologo`),
  UNIQUE KEY `numero_licencia` (`numero_licencia`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `odontologo`
--

INSERT INTO `odontologo` (`id_odontologo`, `numero_licencia`, `nombre`, `apellido`, `especialidad`, `correo`, `telefono`) VALUES
(1, '76840724', 'Camilo', 'Cruz', 'odontologo', 'camilocru@23gmail.com', '3152284026'),
(2, '75243584', 'Andres', 'Muñoz', 'odontologo', 'andresmuñ@14gmail.com', '3186645288'),
(4, '75423567', 'Jhojan', 'Fernandez', 'odontologo', 'jhojanfer@14gmail.com', '3158779522');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

DROP TABLE IF EXISTS `paciente`;
CREATE TABLE IF NOT EXISTS `paciente` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `documento_identidad` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` varchar(10) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_paciente`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id_paciente`, `documento_identidad`, `nombre`, `apellido`, `fecha_nacimiento`, `genero`, `direccion`, `telefono`, `correo`) VALUES
(1, '12345678', 'Juan', 'Perez', '1995-05-10', 'M', 'Calle 10', '3001234567', 'juan@mail.com'),
(2, '87654321', 'Maria', 'Gomez', '1998-08-20', 'F', 'Carrera 15', '3019876543', 'maria@mail.com'),
(3, '123', 'Juan', 'Guzman', '1990-01-15', 'M', 'Calle 123', '3105555555', 'juan@email.com'),
(7, '201548869', 'Camilo', 'Bonilla', '2001-12-24', 'Masculino', 'Calle #3 3-38', '3001234567', 'cami@mail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tratamiento`
--

DROP TABLE IF EXISTS `tratamiento`;
CREATE TABLE IF NOT EXISTS `tratamiento` (
  `id_tratamiento` int NOT NULL AUTO_INCREMENT,
  `nombre_tratamiento` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_spanish_ci,
  `costo_base` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_tratamiento`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `tratamiento`
--

INSERT INTO `tratamiento` (`id_tratamiento`, `nombre_tratamiento`, `descripcion`, `costo_base`) VALUES
(1, 'Limpieza Dental', 'Eliminación de placa bacteriana y cálculo dental.', 80000.00),
(2, 'Resina Dental', 'Restauración estética con resina fotocurada.', 150000.00),
(3, 'Extracción Dental', 'Extracción de una pieza dental.', 120000.00),
(4, 'Endodoncia', 'Tratamiento de conducto para conservar la pieza dental.', 450000.00),
(5, 'Ortodoncia', 'Corrección de la posición de los dientes mediante brackets.', 2500000.00),
(6, 'Blanqueamiento Dental', 'Procedimiento estético para aclarar el color de los dientes.', 350000.00),
(7, 'Implante Dental', 'Reemplazo de un diente perdido mediante implante.', 3500000.00),
(8, 'Prótesis Dental', 'Rehabilitación de dientes perdidos con prótesis.', 1800000.00);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
