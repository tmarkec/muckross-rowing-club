CREATE TABLE public.rigging_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL,
  category_label text NOT NULL,
  section text NOT NULL CHECK (section IN ('sculling','sweep')),
  boat text NOT NULL,
  oar_range text NOT NULL,
  inboard_range text NOT NULL,
  span_or_spread_range text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_key, section, boat)
);

GRANT SELECT ON public.rigging_measurements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rigging_measurements TO authenticated;
GRANT ALL ON public.rigging_measurements TO service_role;

ALTER TABLE public.rigging_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY rigging_select_public ON public.rigging_measurements
  FOR SELECT TO public USING (true);
CREATE POLICY rigging_admin_insert ON public.rigging_measurements
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY rigging_admin_update ON public.rigging_measurements
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY rigging_admin_delete ON public.rigging_measurements
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_rigging_updated_at BEFORE UPDATE ON public.rigging_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with current hard-coded ranges
INSERT INTO public.rigging_measurements (category_key, category_label, section, boat, oar_range, inboard_range, span_or_spread_range, sort_order) VALUES
('j17_18_m','J17 & J18 Male (Senior Juniors)','sculling','Single Scull (1x)','286 – 288','87 – 89','158 – 160',1),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sculling','Double Scull (2x)','286 – 288','87 – 89','159 – 160',2),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sculling','Quad Scull (4x)','287 – 289','88 – 89','159 – 161',3),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sweep','Pair (2-)','370 – 372','114 – 116','84 – 86',1),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sweep','Coxed Four (4+)','370 – 372','114 – 115','84 – 85',2),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sweep','Coxless Four (4-)','371 – 373','113 – 115','83 – 85',3),
('j17_18_m','J17 & J18 Male (Senior Juniors)','sweep','Eight (8+)','371 – 373','113 – 114','83 – 84',4),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sculling','Single Scull (1x)','284 – 286','86 – 88','157 – 159',1),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sculling','Double Scull (2x)','284 – 286','86 – 88','158 – 159',2),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sculling','Quad Scull (4x)','285 – 287','87 – 88','158 – 160',3),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sweep','Pair (2-)','368 – 370','113 – 115','83 – 85',1),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sweep','Coxed Four (4+)','368 – 370','113 – 114','83 – 84',2),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sweep','Coxless Four (4-)','369 – 371','112 – 114','82 – 84',3),
('j17_18_f','J17 & J18 Female (Senior Juniors)','sweep','Eight (8+)','369 – 371','112 – 113','82 – 83',4),
('j15_16_m','J15 & J16 Male','sculling','Single Scull (1x)','284 – 286','86 – 88','157 – 159',1),
('j15_16_m','J15 & J16 Male','sculling','Double Scull (2x)','284 – 286','86 – 88','158 – 159',2),
('j15_16_m','J15 & J16 Male','sculling','Quad Scull (4x)','285 – 287','87 – 88','158 – 160',3),
('j15_16_m','J15 & J16 Male','sweep','Pair (2-)','368 – 370','113 – 115','83 – 85',1),
('j15_16_m','J15 & J16 Male','sweep','Coxed Four (4+)','368 – 370','113 – 114','83 – 84',2),
('j15_16_m','J15 & J16 Male','sweep','Coxless Four (4-)','369 – 371','112 – 114','82 – 84',3),
('j15_16_m','J15 & J16 Male','sweep','Eight (8+)','369 – 371','112 – 113','82 – 83',4),
('j15_16_f','J15 & J16 Female','sculling','Single Scull (1x)','282 – 284','85 – 87','156 – 158',1),
('j15_16_f','J15 & J16 Female','sculling','Double Scull (2x)','282 – 284','85 – 87','156 – 158',2),
('j15_16_f','J15 & J16 Female','sculling','Quad Scull (4x)','283 – 285','86 – 87','157 – 159',3),
('j15_16_f','J15 & J16 Female','sweep','Pair (2-)','366 – 368','112 – 114','82 – 84',1),
('j15_16_f','J15 & J16 Female','sweep','Coxed Four (4+)','366 – 368','112 – 113','82 – 83',2),
('j15_16_f','J15 & J16 Female','sweep','Coxless Four (4-)','367 – 369','111 – 113','81 – 83',3),
('j15_16_f','J15 & J16 Female','sweep','Eight (8+)','367 – 369','112 – 113','82 – 84',4),
('j14_mixed','J14 & Younger (Mixed / Development) — Sculling only','sculling','Single Scull (1x)','280 – 283','85 – 87','156 – 158',1),
('j14_mixed','J14 & Younger (Mixed / Development) — Sculling only','sculling','Double Scull (2x)','280 – 283','85 – 87','156 – 158',2),
('j14_mixed','J14 & Younger (Mixed / Development) — Sculling only','sculling','Coxed Quad (4x+)','281 – 284','86 – 87','157 – 159',3);