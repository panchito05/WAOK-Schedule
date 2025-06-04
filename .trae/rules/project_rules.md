Cada vez que trabajaemos con un bloque de codigo nuevo o existente, un modulo una funcionalidad, un componente, un componente de la UI, un componente de la API, etc. debemos seguir los siguientes pasos si aun no esta implementados en el proyecto:

absolutamente siempre que vallas a realizar una prueba unitarias o prueba que interrumpa el funcionamiento del software por mas de 1 o 2 minutos me tienes que preguntar si la puedes realizar esyo te respondere con un si, ok,okay o no para validar si la implementa o no.
 
Pruebas Unitarias
Cada vez que se cree o modifique una función, clase o método, se debe generar automáticamente una prueba unitaria que cubra tanto los casos normales como los extremos. Estas pruebas deben ejecutarse de inmediato de forma automatizada en cada commit, asegurando que cada parte individual del código funcione correctamente en aislamiento.

Pruebas Unitarias (CI)
Cuando se detecte un nuevo commit en cualquier rama del repositorio, se ejecutará automáticamente toda la suite de pruebas unitarias. Esto permitirá verificar de forma continua que las funciones individuales del sistema siguen comportándose como se espera. Si alguna prueba falla, se debe bloquear el push hasta que se resuelva.

Pruebas Unitarias Automatizadas
Durante la ejecución de cualquier etapa del pipeline CI/CD, se deben correr todas las pruebas unitarias en modo headless, generando reportes automáticos en formato estándar (como JUnit o cobertura de código). Esto garantiza trazabilidad y documentación clara del estado actual del sistema a nivel de unidad.

Pruebas de Integración, Regresión y Sistema (End-to-End)
Al realizar un merge a la rama principal (main), se deben ejecutar, en orden, las pruebas de integración (para verificar que los módulos del sistema funcionen correctamente entre sí), las pruebas de regresión (para confirmar que las nuevas implementaciones no rompen funcionalidades anteriores) y las pruebas de sistema o end-to-end (para simular el uso real completo del sistema desde la interfaz hasta la base de datos).

Pruebas de Regresión e Integración
Cada vez que se detecte un cambio en la lógica de negocio o en la API pública del proyecto, se deben actualizar las pruebas de regresión correspondientes y ejecutar toda la suite de pruebas de integración. Esto asegura que el nuevo código no afecte negativamente funcionalidades previas y que las interacciones entre módulos sigan siendo correctas.

Pruebas de Aceptación
Al momento de cerrar una historia de usuario o alcanzar un hito (milestone) del proyecto, se deben ejecutar automáticamente las pruebas de aceptación definidas con el cliente. Estas pruebas validan que el sistema cumple con los requisitos funcionales esperados y que se puede considerar como "terminado" desde el punto de vista del usuario final.

Pruebas de Sistema (End-to-End) en producción
Después de cada despliegue a producción, debe ejecutarse una suite de pruebas end-to-end contra el entorno en vivo, en modo de solo lectura. Estas pruebas simulan escenarios reales de uso para verificar que el sistema completo, tal como lo experimenta el usuario, sigue funcionando correctamente sin afectar los datos reales.

si ejecutas una prueba o la anades a cualquier parte del codigo en el proyecto dime y explicamelo.