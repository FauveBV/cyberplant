import { config, fields, singleton } from '@keystatic/core';

// Storage: local en dev (sin setup) · GitHub en producción (login + commit al repo).
const isProd = process.env.NODE_ENV === 'production';

const textList = (label: string, itemLabel = 'Ítem') =>
  fields.array(fields.text({ label: itemLabel }), { label, itemLabel: (p) => p.value || '—' });

export default config({
  // dev: edición local sin login · producción: Keystatic Cloud (login + commit al repo)
  storage: isProd ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: 'fauve/cyberplant' },
  ui: {
    brand: { name: 'cyberplant' },
    navigation: {
      Contenido: ['landing', 'bio'],
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
  },
});
