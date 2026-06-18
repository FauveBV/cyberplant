import { config, fields, singleton } from '@keystatic/core';

// Storage: local en dev (sin login) · Keystatic Cloud en producción (login + commit al repo).
const isProd = process.env.NODE_ENV === 'production';

const textList = (label: string, itemLabel = 'Ítem') =>
  fields.array(fields.text({ label: itemLabel }), { label, itemLabel: (p) => p.value || '—' });

const metaline = fields.array(
  fields.object({
    k: fields.text({ label: 'Clave' }),
    v: fields.text({ label: 'Valor' }),
  }),
  { label: 'Metaline', itemLabel: (p) => p.fields.k.value }
);

export default config({
  storage: isProd ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: 'fauve/cyberplant' },
  ui: {
    brand: { name: 'cyberplant' },
    navigation: {
      Páginas: ['landing', 'sistema', 'bio', 'cyberdeck', 'portafolio', 'casoEjemplo'],
    },
  },
  singletons: {
    landing: singleton({
      label: 'Landing (home)',
      path: 'src/data/landing',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.text({ label: 'Nombre', multiline: true, description: 'Una línea por renglón.' }),
        bajada: fields.text({ label: 'Bajada', multiline: true }),
        firmaLink: fields.text({ label: 'Texto del enlace a la firma' }),
        areas: fields.array(
          fields.object({
            label: fields.text({ label: 'Área' }),
            desc: fields.text({ label: 'Descripción' }),
            href: fields.text({ label: 'Ruta' }),
          }),
          { label: 'Áreas', itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),

    sistema: singleton({
      label: 'Sistema · cabecera',
      path: 'src/data/sistema',
      format: { data: 'yaml' },
      schema: {
        id: fields.text({ label: 'Etiqueta superior' }),
        titulo: fields.text({ label: 'Título (sin acento)' }),
        acento: fields.text({ label: 'Palabra de acento (azul)' }),
        thesis: fields.text({ label: 'Bajada', multiline: true }),
        metaline,
      },
    }),

    bio: singleton({
      label: 'Bio',
      path: 'src/data/bio',
      format: { data: 'yaml' },
      schema: {
        id: fields.text({ label: 'Etiqueta superior' }),
        titulo: fields.text({ label: 'Título (h1)' }),
        thesis: fields.text({ label: 'Bajada', multiline: true }),
        educacion: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título' }),
            org: fields.text({ label: 'Organización' }),
            fecha: fields.text({ label: 'Fecha' }),
          }),
          { label: 'Educación', itemLabel: (p) => p.fields.titulo.value }
        ),
        proyectoTitulo: fields.text({ label: 'Proyecto de título', multiline: true }),
        experiencia: fields.array(
          fields.object({
            rol: fields.text({ label: 'Rol' }),
            org: fields.text({ label: 'Organización' }),
            fecha: fields.text({ label: 'Fecha' }),
            bullets: textList('Bullets', 'Bullet'),
          }),
          { label: 'Experiencia', itemLabel: (p) => p.fields.rol.value }
        ),
        tecnicas: textList('Habilidades técnicas', 'Técnica'),
        interpersonales: textList('Habilidades interpersonales', 'Interpersonal'),
        intereses: textList('Intereses', 'Interés'),
        contacto: fields.array(
          fields.object({
            label: fields.text({ label: 'Etiqueta' }),
            valor: fields.text({ label: 'Valor' }),
            href: fields.text({ label: 'Enlace (opcional)' }),
          }),
          { label: 'Contacto', itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),

    cyberdeck: singleton({
      label: 'Cyberdeck',
      path: 'src/data/cyberdeck',
      format: { data: 'yaml' },
      schema: {
        id: fields.text({ label: 'Etiqueta superior' }),
        titulo: fields.text({ label: 'Título (sin acento)' }),
        acento: fields.text({ label: 'Palabra de acento (azul)' }),
        thesis: fields.text({ label: 'Bajada', multiline: true }),
        metaline,
        fichaTitulo: fields.text({ label: 'Ficha · título' }),
        fichaTexto: fields.text({ label: 'Ficha · texto', multiline: true }),
        osTitulo: fields.text({ label: 'OS · título' }),
        osOpciones: fields.array(
          fields.object({
            nombre: fields.text({ label: 'Nombre' }),
            badge: fields.text({ label: 'Etiqueta' }),
            src: fields.text({ label: 'Subtítulo técnico' }),
            texto: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'OS · opciones', itemLabel: (p) => p.fields.nombre.value }
        ),
        tabla: fields.array(
          fields.object({
            os: fields.text({ label: 'OS' }),
            peso: fields.text({ label: 'Peso' }),
            bits: fields.text({ label: '32-bit' }),
            init: fields.text({ label: 'init' }),
          }),
          { label: 'OS · tabla comparativa', itemLabel: (p) => p.fields.os.value }
        ),
        traspasoTitulo: fields.text({ label: 'Traspaso · título' }),
        pasos: fields.array(
          fields.object({
            capa: fields.text({ label: 'Capa' }),
            titulo: fields.text({ label: 'Título' }),
            texto: fields.text({ label: 'Texto', multiline: true }),
          }),
          { label: 'Pasos del traspaso', itemLabel: (p) => p.fields.titulo.value }
        ),
        backlogTitulo: fields.text({ label: 'Backlog · título' }),
        backlog: fields.array(
          fields.object({
            k: fields.text({ label: 'Letra' }),
            texto: fields.text({ label: 'Texto', multiline: true }),
            estado: fields.text({ label: 'Estado' }),
          }),
          { label: 'Backlog', itemLabel: (p) => p.fields.texto.value }
        ),
      },
    }),

    portafolio: singleton({
      label: 'Portafolio',
      path: 'src/data/portafolio',
      format: { data: 'yaml' },
      schema: {
        id: fields.text({ label: 'Etiqueta superior' }),
        titulo: fields.text({ label: 'Título (sin acento)' }),
        acento: fields.text({ label: 'Palabra de acento (azul)' }),
        thesis: fields.text({ label: 'Bajada', multiline: true }),
        metaline,
        casos: fields.array(
          fields.object({
            num: fields.text({ label: 'Número' }),
            titulo: fields.text({ label: 'Título' }),
            desc: fields.text({ label: 'Descripción', multiline: true }),
            estado: fields.text({ label: 'Estado' }),
          }),
          { label: 'Casos', itemLabel: (p) => p.fields.titulo.value }
        ),
      },
    }),

    casoEjemplo: singleton({
      label: 'Portafolio · caso de ejemplo',
      path: 'src/data/caso-ejemplo',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.text({ label: 'Título' }),
        bajada: fields.text({ label: 'Bajada', multiline: true }),
        meta: fields.array(
          fields.object({
            label: fields.text({ label: 'Campo' }),
            valor: fields.text({ label: 'Valor' }),
          }),
          { label: 'Ficha del caso', itemLabel: (p) => p.fields.label.value }
        ),
        bloques: fields.array(
          fields.object({
            num: fields.text({ label: 'Número' }),
            titulo: fields.text({ label: 'Título' }),
            texto: fields.text({ label: 'Texto', multiline: true }),
          }),
          { label: 'Bloques', itemLabel: (p) => p.fields.titulo.value }
        ),
        metricas: fields.array(
          fields.object({
            valor: fields.text({ label: 'Valor' }),
            label: fields.text({ label: 'Etiqueta' }),
          }),
          { label: 'Métricas', itemLabel: (p) => p.fields.valor.value }
        ),
      },
    }),
  },
});
