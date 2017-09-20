SELECT *
FROM relations r
  INNER JOIN nodes n ON r.node_id = n.id
  INNER JOIN types t ON r.type_id = t.id
WHERE
  lower(n.name) = lower(${name})
ORDER BY n.name
LIMIT ${pageSize} OFFSET ${offset}