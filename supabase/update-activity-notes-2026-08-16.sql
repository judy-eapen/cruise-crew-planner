-- v4c: Universal notes now carry concrete height guidance (what the 3-9s vs 10+ can ride).
-- UPDATE only, idempotent.
update activities set note = 'Harry Potter Diagon Alley — Gringotts ride 42in; kids under ~42in mostly wands + shows. Hogwarts Express needs a 2-park ticket' where id = 'US';
update activities set note = 'HP Hogsmeade: Hagrid''s + Forbidden Journey need 48in — best for the 10+ crowd; littles get Hippogriff (36in) + wands' where id = 'IOA';
update activities set note = 'Most kid-friendly big park: HP Ministry + Mario Kart 40in, Yoshi 34in — most 5yos+ ride lots; big coasters 48in' where id = 'EPIC';
