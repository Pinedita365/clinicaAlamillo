-- Datos iniciales: Clínica Dental Alamillo
-- REPLACE INTO: actualiza si ya existe la fila, inserta si no

REPLACE INTO dental_services (id, name, description, duration, price_range, active, icon_key) VALUES
(1, 'Limpieza dental',          'Eliminación de sarro y pulido profesional con ultrasonidos.',              '20 min', '60 – 80 €',       1, 'cleaning'),
(2, 'Curetajes',                'Tratamiento periodontal profundo para encías sanas.',                      '30 min', '80 – 150 €',      1, 'periodontics'),
(3, 'Obturaciones / empastes',  'Restauración de caries con composite de última generación.',              '30 min', '60 – 120 €',      1, 'filling'),
(4, 'Endodoncia',               'Tratamiento de conductos sin dolor con técnicas rotatorias.',              '30 min', '200 – 350 €',     1, 'endodontics'),
(5, 'Valoración ortodoncia',    'Primera consulta de ortodoncia con diagnóstico y plan personalizado.',     '20 min', 'Gratuita',        1, 'braces'),
(6, 'Revisión ortodoncia',      'Revisión de seguimiento de tratamiento ortodóncico activo.',               '10 min', '30 – 50 €',       1, 'braces-check'),
(7, 'Valoración implantes',     'Consulta para valorar la colocación de implantes dentales.',               '20 min', 'Gratuita',        1, 'implant'),
(8, 'Primera visita',           'Exploración general, radiografía y plan de tratamiento personalizado.',    '20 min', 'Gratuita',        1, 'first-visit');
