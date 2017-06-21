CREATE TABLE IF NOT EXISTS author(
    id 				serial primary key,
    first_name		text,
    second_name		text,
    active			boolean
);

CREATE TABLE IF NOT EXISTS article(
    id 				serial primary key,
    title			text,
    URL_image		text,
    resume			text,
    body			text,
    category		text,
    thumbs_up		integer,
    thumbs_down		integer,
    active			boolean,
    id_author		integer references author on delete restrict
);
