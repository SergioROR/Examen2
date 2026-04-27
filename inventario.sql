--
-- PostgreSQL database dump
--

\restrict uIreWfPscF89I2lDloXRVeDfc3vaQdLmU9HdqxzOAby4BZd2wYXKyrhW3wsaKzY

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamento (
    id_departamento integer NOT NULL,
    nombre character varying,
    descripcion character varying,
    id_plantel integer
);


ALTER TABLE public.departamento OWNER TO postgres;

--
-- Name: departamento_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamento_id_departamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamento_id_departamento_seq OWNER TO postgres;

--
-- Name: departamento_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamento_id_departamento_seq OWNED BY public.departamento.id_departamento;


--
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido (
    id_detalle_pedido integer NOT NULL,
    cantidad bigint,
    id_pedido integer,
    id_productos integer
);


ALTER TABLE public.detalle_pedido OWNER TO postgres;

--
-- Name: detalle_pedido_id_detalle_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_id_detalle_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_id_detalle_pedido_seq OWNER TO postgres;

--
-- Name: detalle_pedido_id_detalle_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_id_detalle_pedido_seq OWNED BY public.detalle_pedido.id_detalle_pedido;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id_pedido integer NOT NULL,
    fecha character varying,
    descripcion character varying,
    id_plantel integer,
    estado character varying,
    id_usuario integer
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_pedido_seq OWNER TO postgres;

--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_pedido_seq OWNED BY public.pedidos.id_pedido;


--
-- Name: planteles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planteles (
    id_plantel integer NOT NULL,
    nombre character varying NOT NULL,
    imagen character varying,
    es_principal boolean DEFAULT false
);


ALTER TABLE public.planteles OWNER TO postgres;

--
-- Name: planteles_id_plantel_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planteles_id_plantel_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planteles_id_plantel_seq OWNER TO postgres;

--
-- Name: planteles_id_plantel_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planteles_id_plantel_seq OWNED BY public.planteles.id_plantel;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_productos integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion character varying,
    modelo character varying,
    cantidad bigint DEFAULT 0 NOT NULL,
    num_serie character varying NOT NULL,
    id_plantel integer NOT NULL,
    id_departamento integer NOT NULL,
    creacion timestamp without time zone DEFAULT now() NOT NULL,
    actualizacion timestamp without time zone DEFAULT now(),
    CONSTRAINT productos_check CHECK ((cantidad >= 0))
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_productos_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_productos_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_productos_seq OWNER TO postgres;

--
-- Name: productos_id_productos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_productos_seq OWNED BY public.productos.id_productos;


--
-- Name: registro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro (
    id_registro integer NOT NULL,
    fecha character varying,
    tipo character varying,
    nota character varying,
    id_departamento integer,
    id_plantel integer,
    id_usuario integer,
    id_plantel_origen integer
);


ALTER TABLE public.registro OWNER TO postgres;

--
-- Name: registro_id_registro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_id_registro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_id_registro_seq OWNER TO postgres;

--
-- Name: registro_id_registro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_id_registro_seq OWNED BY public.registro.id_registro;


--
-- Name: registro_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_productos (
    id_registro_productos integer NOT NULL,
    cantidad bigint,
    id_productos integer,
    id_registro integer
);


ALTER TABLE public.registro_productos OWNER TO postgres;

--
-- Name: registro_productos_id_registro_productos_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_productos_id_registro_productos_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_productos_id_registro_productos_seq OWNER TO postgres;

--
-- Name: registro_productos_id_registro_productos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_productos_id_registro_productos_seq OWNED BY public.registro_productos.id_registro_productos;


--
-- Name: solicitud_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_producto (
    id_solicitud integer NOT NULL,
    nombre character varying,
    descripcion character varying,
    estado character varying,
    id_usuario integer,
    id_plantel integer,
    cantidad integer,
    modelo character varying,
    id_producto_creado integer
);


ALTER TABLE public.solicitud_producto OWNER TO postgres;

--
-- Name: solicitud_producto_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_producto_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_producto_id_solicitud_seq OWNER TO postgres;

--
-- Name: solicitud_producto_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_producto_id_solicitud_seq OWNED BY public.solicitud_producto.id_solicitud;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying,
    apellidos character varying,
    password character varying,
    rol character varying,
    id_plantel integer,
    correo character varying,
    estado boolean DEFAULT true NOT NULL,
    imagen character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: departamento id_departamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamento_id_departamento_seq'::regclass);


--
-- Name: detalle_pedido id_detalle_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN id_detalle_pedido SET DEFAULT nextval('public.detalle_pedido_id_detalle_pedido_seq'::regclass);


--
-- Name: pedidos id_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedidos_id_pedido_seq'::regclass);


--
-- Name: planteles id_plantel; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planteles ALTER COLUMN id_plantel SET DEFAULT nextval('public.planteles_id_plantel_seq'::regclass);


--
-- Name: productos id_productos; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_productos SET DEFAULT nextval('public.productos_id_productos_seq'::regclass);


--
-- Name: registro id_registro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro ALTER COLUMN id_registro SET DEFAULT nextval('public.registro_id_registro_seq'::regclass);


--
-- Name: registro_productos id_registro_productos; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_productos ALTER COLUMN id_registro_productos SET DEFAULT nextval('public.registro_productos_id_registro_productos_seq'::regclass);


--
-- Name: solicitud_producto id_solicitud; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_producto ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_producto_id_solicitud_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamento (id_departamento, nombre, descripcion, id_plantel) FROM stdin;
2	Asistentes	oficina	2
3	Promotoria	oficina	3
4	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	7
5	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	2
6	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	3
7	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	4
8	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	5
1	Control de Equipos y Soporte	Departamento de control de equipos y soporte técnico	6
9	Promotoria	Área encargada de difundir la oferta académica de la institución	2
10	Direccion	Directora	2
\.


--
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido (id_detalle_pedido, cantidad, id_pedido, id_productos) FROM stdin;
20	1	17	33
21	1	18	35
22	1	19	33
23	1	20	35
24	1	21	33
25	1	22	33
26	1	23	40
27	1	24	42
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id_pedido, fecha, descripcion, id_plantel, estado, id_usuario) FROM stdin;
17	2026-03-30	Entrega de producto solicitado	4	entregado	14
19	2026-03-31	teclado para la sala 1	3	entregado	17
20	2026-04-01	sala 4	3	entregado	17
18	2026-03-31	Mouse para sala 2	2	entregado	15
21	2026-04-06	Para sala 3	2	entregado	15
23	2026-04-06	Entrega de producto solicitado	2	entregado	15
22	2026-04-06	Para la sala 1	2	entregado	15
24	2026-04-07	Entrega de producto solicitado	2	entregado	15
\.


--
-- Data for Name: planteles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planteles (id_plantel, nombre, imagen, es_principal) FROM stdin;
2	Juarez	1772636410015-74090282.png	f
3	Torres Landa	1772815978914-99268348.png	f
4	Paraisos	1772816362454-273356147.png	f
5	Reforma	1772826879094-326290614.png	f
7	Hilario Medina	1775442497854-494737076.png	f
6	Justo Sierra	1772835144167-432348041.png	t
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id_productos, nombre, descripcion, modelo, cantidad, num_serie, id_plantel, id_departamento, creacion, actualizacion) FROM stdin;
31	Pc Escritorio Gamer Blanca Radeon Vega	Ryzen 7 5700G Enfriamiento Líquido con Pantalla LED 32GB RAM 1TB NVME SSD computadora Gamer	Ren Tech Ryzen 7 5700G	4	pc123	6	1	2026-03-29 18:47:23.961518	2026-03-29 18:48:17.131714
32	Pc Escritorio Gamer Blanca Radeon Vega	Ryzen 7 5700G Enfriamiento Líquido con Pantalla LED 32GB RAM 1TB NVME SSD computadora Gamer	Ren Tech Ryzen 7 5700G	1	pc123	2	1	2026-03-29 18:48:17.131714	2026-03-29 18:48:17.131714
34	Teclado alambrico	Teclado alambrico negro	PerfectChoice	1	Pc-1244	4	1	2026-03-29 19:03:20.520477	2026-03-29 19:03:20.520477
36	Teclado alambrico	Teclado alambrico negro	PerfectChoice	1	Pc-1244	3	1	2026-03-31 18:11:09.907126	2026-03-31 18:11:09.907126
37	Mouse	mouse gamer	xpv-12	1	pc124	3	1	2026-03-31 18:16:46.06374	2026-03-31 18:16:46.06374
35	Mouse	mouse gamer	xpv-12	1	pc124	6	1	2026-03-31 17:26:54.853319	2026-04-01 20:16:22.513531
38	Mouse	mouse gamer	xpv-12	1	pc124	2	1	2026-04-01 20:16:22.513531	2026-04-01 20:16:22.513531
40	Impresora a color	color	hp	2	pc345	6	1	2026-04-06 07:31:16.264703	2026-04-06 07:31:49.918199
41	Impresora a color	color	hp	1	pc345	2	5	2026-04-06 07:31:49.918199	2026-04-06 07:31:49.918199
33	Teclado alambrico	Teclado alambrico negro	PerfectChoice	3	Pc-1244	6	1	2026-03-29 19:02:51.142171	2026-04-06 07:33:50.784297
39	Teclado alambrico	Teclado alambrico negro	PerfectChoice	2	Pc-1244	2	5	2026-04-05 20:51:04.415819	2026-04-06 07:33:50.784297
42	Ventilador	de velocidad potente	lg	1	pc12	6	1	2026-04-06 18:09:46.085937	2026-04-06 18:10:06.41525
43	Ventilador	de velocidad potente	lg	1	pc12	2	5	2026-04-06 18:10:06.41525	2026-04-06 18:10:06.41525
\.


--
-- Data for Name: registro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro (id_registro, fecha, tipo, nota, id_departamento, id_plantel, id_usuario, id_plantel_origen) FROM stdin;
65	2026-04-01 20:16:22.513531-06	salida	Salida pedido #18	1	6	15	2
66	2026-04-01 20:16:22.513531-06	entrada	Entrada pedido #18	1	2	15	6
67	2026-04-05 20:51:04.415819-06	salida	Salida pedido #21	1	6	15	2
68	2026-04-05 20:51:04.415819-06	entrada	Entrada pedido #21	5	2	15	6
69	2026-04-06 07:31:16	entrada	Alta de producto: Impresora a color	1	6	12	\N
70	2026-04-06 07:31:49.918199-06	salida	Salida pedido #23	1	6	15	2
71	2026-04-06 07:31:49.918199-06	entrada	Entrada pedido #23	5	2	15	6
57	2026-03-30 19:02:51	entrada	Alta de producto: Teclado alambrico	1	6	11	\N
58	2026-03-29 19:03:20.520477-06	salida	Salida pedido #17	1	6	14	4
59	2026-03-29 19:03:20.520477-06	entrada	Entrada pedido #17	1	4	14	6
60	2026-03-31 17:26:54	entrada	Alta de producto: Mouse	1	6	12	\N
61	2026-03-31 18:11:09.907126-06	salida	Salida pedido #19	1	6	17	3
62	2026-03-31 18:11:09.907126-06	entrada	Entrada pedido #19	1	3	17	6
63	2026-03-31 18:16:46.06374-06	salida	Salida pedido #20	1	6	17	3
64	2026-03-31 18:16:46.06374-06	entrada	Entrada pedido #20	1	3	17	6
72	2026-04-06 07:33:50.784297-06	salida	Salida pedido #22	1	6	15	2
73	2026-04-06 07:33:50.784297-06	entrada	Entrada pedido #22	5	2	15	6
74	2026-04-07 18:09:46	entrada	Alta de producto: Ventilador	1	6	12	\N
75	2026-04-06 18:10:06.41525-06	salida	Salida pedido #24	1	6	15	2
76	2026-04-06 18:10:06.41525-06	entrada	Entrada pedido #24	5	2	15	6
\.


--
-- Data for Name: registro_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_productos (id_registro_productos, cantidad, id_productos, id_registro) FROM stdin;
60	7	33	57
61	1	33	58
62	1	33	59
63	3	35	60
64	1	33	61
65	1	33	62
66	1	35	63
67	1	35	64
68	1	35	65
69	1	35	66
70	1	33	67
71	1	33	68
72	3	40	69
73	1	40	70
74	1	40	71
75	1	33	72
76	1	33	73
77	2	42	74
78	1	42	75
79	1	42	76
\.


--
-- Data for Name: solicitud_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_producto (id_solicitud, nombre, descripcion, estado, id_usuario, id_plantel, cantidad, modelo, id_producto_creado) FROM stdin;
7	Teclado alambrico	Teclado alambrico negro	atendido	14	4	1	PerfectChoice	33
8	Impresora a color	color	atendido	15	2	1	hp	40
9	Ventilador	de velocidad potente	atendido	15	2	1	lg	42
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombre, apellidos, password, rol, id_plantel, correo, estado, imagen) FROM stdin;
17	Aldo David	Rodriguez Lopez	$2b$10$4CNVtu3KOXwR8cTFqrMzqOf/H3Av2RMf7Z0.9oU9nmZ1q3SN7XG1m	Usuario	3	aldo12@gmail.com	t	logo leon.png
11	Leobardo	Amezcua Fonseca	$2b$10$bzl75Yy1x9ilTxFZjsy45OQqaWqRx6kTfWNLi3Rzh1Y4JKFKWn2Bi	Admin	6	leo12@gmail.com	t	logo cara.jpg
12	Sergio Ricardo	Oviedo Rodriguez	$2b$10$KucLrIV.V2jqKFQoi5Y4qu/S3DZvSiGahX2tgXavRpplOkWJjO0Se	Admin	6	sergio12@gmail.com	t	logo persona.jpg
14	Roberto Carlos	Oviedo Rodriguez	$2b$10$.p9SOiYfWUQzmhbw0VSGP.FZLFGH6hR.V2KoaFSx1.TRUQ01usLbu	Usuario	4	roberto12@gmail.com	t	logo craneo.jpg
15	Gonzalo Leonardo	Ramirez Lara	$2b$10$KEYcmH5GZuyCcLP9PU0iP.MDDNHmbtBR..xkpEdz9MAl1rWeyMwYO	Usuario	2	leonardo12@gmail.com	t	logo dragon.jpg
\.


--
-- Name: departamento_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamento_id_departamento_seq', 10, true);


--
-- Name: detalle_pedido_id_detalle_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_id_detalle_pedido_seq', 27, true);


--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_pedido_seq', 24, true);


--
-- Name: planteles_id_plantel_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.planteles_id_plantel_seq', 7, true);


--
-- Name: productos_id_productos_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_productos_seq', 43, true);


--
-- Name: registro_id_registro_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_id_registro_seq', 76, true);


--
-- Name: registro_productos_id_registro_productos_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_productos_id_registro_productos_seq', 79, true);


--
-- Name: solicitud_producto_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_producto_id_solicitud_seq', 9, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 17, true);


--
-- Name: usuarios correo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT correo UNIQUE (correo);


--
-- Name: departamento id_departamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT id_departamento PRIMARY KEY (id_departamento);


--
-- Name: detalle_pedido id_detalle_pedido; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT id_detalle_pedido PRIMARY KEY (id_detalle_pedido);


--
-- Name: pedidos id_pedido; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT id_pedido PRIMARY KEY (id_pedido);


--
-- Name: planteles id_plantel; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planteles
    ADD CONSTRAINT id_plantel PRIMARY KEY (id_plantel);


--
-- Name: productos id_productos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT id_productos PRIMARY KEY (id_productos);


--
-- Name: registro id_registro; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT id_registro PRIMARY KEY (id_registro);


--
-- Name: registro_productos id_registro_productos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_productos
    ADD CONSTRAINT id_registro_productos PRIMARY KEY (id_registro_productos);


--
-- Name: usuarios id_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT id_usuario PRIMARY KEY (id_usuario);


--
-- Name: solicitud_producto solicitud_producto_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_producto
    ADD CONSTRAINT solicitud_producto_pk PRIMARY KEY (id_solicitud);


--
-- Name: departamento departamento_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- Name: detalle_pedido detalle_pedido_pedidos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pedidos_fk FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido);


--
-- Name: detalle_pedido detalle_pedido_productos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_productos_fk FOREIGN KEY (id_productos) REFERENCES public.productos(id_productos);


--
-- Name: pedidos pedidos_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- Name: pedidos pedidos_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_usuarios_fk FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: productos productos_departamento_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_departamento_fk FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento);


--
-- Name: productos productos_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- Name: registro registro_departamento_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_departamento_fk FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento);


--
-- Name: registro registro_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- Name: registro_productos registro_productos_productos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_productos
    ADD CONSTRAINT registro_productos_productos_fk FOREIGN KEY (id_productos) REFERENCES public.productos(id_productos);


--
-- Name: registro_productos registro_productos_registro_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_productos
    ADD CONSTRAINT registro_productos_registro_fk FOREIGN KEY (id_registro) REFERENCES public.registro(id_registro);


--
-- Name: registro registro_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_usuarios_fk FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: solicitud_producto solicitud_producto_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_producto
    ADD CONSTRAINT solicitud_producto_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- Name: solicitud_producto solicitud_producto_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_producto
    ADD CONSTRAINT solicitud_producto_usuarios_fk FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: usuarios usuarios_planteles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_planteles_fk FOREIGN KEY (id_plantel) REFERENCES public.planteles(id_plantel);


--
-- PostgreSQL database dump complete
--

\unrestrict uIreWfPscF89I2lDloXRVeDfc3vaQdLmU9HdqxzOAby4BZd2wYXKyrhW3wsaKzY

