UPDATE jsh_function 
SET component='/project/ProjectCategoryList' 
WHERE number='project_category';

UPDATE jsh_function 
SET component='/project/ProjectList' 
WHERE number='project_info';

SELECT id, number, name, component 
FROM jsh_function 
WHERE number LIKE 'project%';
