create table messages (
  id serial primary key,
  user_id varchar not null,
  title varchar not null,
  url varchar not null,
  channel_id varchar null,
  message_ts varchar null
);

create table messageUsers (
  message_id int not null,
  user_id varchar not null,
  status int not null,
  primary key(message_id, user_id)
);

GRANT ALL PRIVILEGES ON messages To admin;
GRANT ALL PRIVILEGES ON messageUsers To admin;