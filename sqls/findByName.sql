SELECT *
FROM relations r
  INNER JOIN nodes n ON r.node_id = n.id
  INNER JOIN types t ON r.type_id = t.id
WHERE
  lower(trim(BOTH FROM n.name)) = lower(trim(BOTH FROM ${name}))
ORDER BY n.name
LIMIT ${pageSize} OFFSET ${offset}