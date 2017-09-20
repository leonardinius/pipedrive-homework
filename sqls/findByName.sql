WITH left_matches AS (
    SELECT n.id as id, n.name as org_name, t.name as relationship_type
    FROM relations r
      INNER JOIN nodes n ON r.left_id = n.id
      INNER JOIN types t ON r.type_id = t.id
    WHERE
      lower(n.name) = lower(${name})
), right_matches AS (
    SELECT n.id, n.name as org_name, t.reverse_name as relationship_type
    FROM relations r
      INNER JOIN nodes n ON r.right_id = n.id
      INNER JOIN types t ON r.type_id = t.id
    WHERE
      lower(n.name) = lower(${name})
), union_all as (
    SELECT * FROM left_matches
    UNION ALL
    SELECT * FROM right_matches
)
SELECT DISTINCT ON (org_name, relationship_type) org_name, relationship_type FROM union_all
ORDER BY org_name
LIMIT ${pageSize}
OFFSET ${offset}