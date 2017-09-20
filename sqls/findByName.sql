WITH left_matches AS (
    SELECT r.id as id, r.name as org_name, t.reverse_name as relationship_type
    FROM relations rel
      INNER JOIN nodes l ON rel.left_id = l.id
      INNER JOIN nodes r ON rel.right_id = r.id
      INNER JOIN types t ON rel.type_id = t.id
    WHERE
      lower(l.name) = lower(${name})
), right_matches AS (
    SELECT l.id as id, l.name as org_name, t.name as relationship_type
    FROM relations rel
      INNER JOIN nodes l ON rel.left_id = l.id
      INNER JOIN nodes r ON rel.right_id = r.id
      INNER JOIN types t ON rel.type_id = t.id
    WHERE
      lower(r.name) = lower(${name})
), union_all as (
  SELECT * FROM left_matches
  UNION ALL
  SELECT * FROM right_matches
)
SELECT DISTINCT ON (org_name, relationship_type) org_name, relationship_type FROM union_all
ORDER BY org_name
LIMIT ${pageSize}
OFFSET ${offset}