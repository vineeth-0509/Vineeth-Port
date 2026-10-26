-- Reference only: the API creates these tables automatically on first request.
CREATE TABLE IF NOT EXISTS projects(
  id text PRIMARY KEY, position int NOT NULL, title text NOT NULL, tagline text, description text,
  tech text[] NOT NULL DEFAULT '{}', link text, image text, year_label text, emoji text, hue int);
CREATE TABLE IF NOT EXISTS experience(
  id text PRIMARY KEY, position int NOT NULL, period text, role text NOT NULL, company text, description text);
