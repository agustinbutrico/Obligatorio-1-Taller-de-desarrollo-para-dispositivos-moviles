    const URL_BASE = "https://movetrack.develotion.com/";
    const URL_IMAGENES = "https://movetrack.develotion.com/imgs/";

    // Referencia al menú lateral
    const menuLateral = document.querySelector("ion-menu[menuId='lateral-menu']");
    const menuToggle = document.querySelector("#menuToggle");

    // Botones que redireccionan a menus
    const btnMenuLogin = document.querySelector("#btnMenuLogin");
    const btnMenuRegister = document.querySelector("#btnMenuRegister");
    const btnLogout = document.querySelector("#btnLogout");

    const btnMenuObtenerRegistros = document.querySelector("#btnMenuObtainRecord");
    const btnMenuAgregarRegistro = document.querySelector("#btnMenuAddRecord");

    const btnMenuObtenerPaises = document.querySelector("#btnMenuObtainCountries");

    // Botones que ejecutan lógica
    const btnLogin = document.querySelector("#btnLogin");
    const btnRegister = document.querySelector("#btnRegister");
    const btnActualizarRegistros = document.querySelector("#btnUpdateTableRecords");
    const btnAgregarRegistro = document.querySelector("#btnAddRecord");

    document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM cargado");

        // Navegación

        // Oculta la navegación al cargar la página dependiendo de si el usuario se encuentra loggeado o no
        MostrarNavegacionPorEstado();
        // Carga la página en el inicio si el usuario está loggeado
        if (localStorage.getItem("apiKey") !== null && localStorage.getItem("iduser") !== null) {
            OcultarContenido();
            document.querySelector("#startSection").classList.remove("hidden");
        }

        // Menu lateral toggle
        if (menuToggle && menuLateral) {
            menuToggle.addEventListener("click", function() {
                menuLateral.toggle();
            });
        }

        // Fin navegación

        // Mapa

        // Inicializa el mapa centrado en America Latina
        window.map = L.map('map').setView([-13.0294377,-61.2088572], 4);

        // Agrega la capa de tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data © OpenStreetMap contributors'
        }).addTo(map);

        function ActualizarMapaTrasCarga() {
            // Fuerza la actualización del mapa después de cargarlo
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        }

        // Fin mapa

        // Display del contenido
    
        // Evento para abrir el menú de Login
        if (btnMenuLogin) {
            btnMenuLogin.addEventListener("click", function() {
                OcultarContenido();
                document.querySelector("#loginSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Evento para repoblar el select en el formulario de registro
        if (btnMenuRegister) {
            btnMenuRegister.addEventListener("click", async function() {
                await PoblarSelectPaises();
                MostrarNavegacionPorEstado();
                document.querySelector("#loginSection").classList.add("hidden");
                document.querySelector("#registerSection").classList.remove("hidden");
            });
        }

        // Logout del usuario
        if (btnLogout) {
            btnLogout.addEventListener("click", function() {
                localStorage.clear();
                console.log("LocalStorage limpiado")
                OcultarContenido();
                document.querySelector("#loginSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Registros
        if(btnMenuObtenerRegistros) {
            btnMenuObtenerRegistros.addEventListener("click", async function() {
                menuLateral.close();
                await ObtenerTiempoRegistros();
                await ObtenerRegistros();
                OcultarContenido();
                document.querySelector("#obtainRecordSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Menú que permite agregar un registro
        if (btnMenuAgregarRegistro) {
            btnMenuAgregarRegistro.addEventListener("click", async function() {
                menuLateral.close();
                await PoblarSelectActividades()
                OcultarContenido();
                document.querySelector("#addRecordSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Paises
        if(btnMenuObtenerPaises) {
            btnMenuObtenerPaises.addEventListener("click", async function() {
                menuLateral.close();
                await MarkersUsuariosPorPais();
                ActualizarMapaTrasCarga();
                OcultarContenido();
                document.querySelector("#map").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }
        
        // Fin display del contenido

        // Funcionalidades botones

        // Login del usuario
        if (btnLogin) {
            btnLogin.addEventListener("click", async function() {
                await DatoLogin();
                OcultarContenido();
                document.querySelector("#startSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Registro del usuario
        if (btnRegister) {
            btnRegister.addEventListener("click", async function() {
                await DatoRegistro();
                OcultarContenido();
                document.querySelector("#startSection").classList.remove("hidden");
                MostrarNavegacionPorEstado();
            });
        }

        // Listener para el botón de actualizar registros
        if(btnActualizarRegistros) {
            btnActualizarRegistros.addEventListener("click", function() {
                ObtenerRegistros();
                MostrarNavegacionPorEstado();
            });
        }

        // Listener para el botón de agregar registros
        if(btnAgregarRegistro) {
            btnAgregarRegistro.addEventListener("click", function() {
                DatoAgregarRegistro();
                MostrarNavegacionPorEstado();
            });
        }

        // Fin funcionalidades botones
    });

    // Menus

    function MostrarNavegacionPorEstado(){
        // Comprueba si el usuario cuenta con credenciales en el localStorage
        let hayUsuarioLoggeado = localStorage.getItem("apiKey") !== null && localStorage.getItem("iduser") !== null;

        if (hayUsuarioLoggeado) {
            document.querySelector("#menuToggle").classList.remove("hidden");
            document.querySelector("#btnMenuLogin").classList.add("hidden");
            document.querySelector("#btnMenuRegister").classList.add("hidden");
            document.querySelector("#btnLogout").classList.remove("hidden");
        } else {
            document.querySelector("#menuToggle").classList.add("hidden");
            document.querySelector("#btnMenuLogin").classList.remove("hidden");
            document.querySelector("#btnMenuRegister").classList.remove("hidden");
            document.querySelector("#btnLogout").classList.add("hidden");
            OcultarContenido();
            document.querySelector("#loginSection").classList.remove("hidden");
        }
    }

    function OcultarContenido(){
        // Oculta todo el contenido
        document.querySelector("#startSection").classList.add("hidden");
        document.querySelector("#loginSection").classList.add("hidden");
        document.querySelector("#registerSection").classList.add("hidden");
        document.querySelector("#addRecordSection").classList.add("hidden");
        document.querySelector("#obtainRecordSection").classList.add("hidden");
        document.querySelector("#map").classList.add("hidden");
    }

    // Trabajando con los datos ingresados en el front

    async function DatoRegistro(){
        let usua = document.querySelector("#register-user").value;
        let pass = document.querySelector("#register-password").value;
        let idPais = document.querySelector("#register-selectCountries ion-select").value;
        
        if (!usua || !pass || !idPais) {
            document.querySelector("#register-messageColor").setAttribute("color", "danger");
            document.querySelector("#register-message").innerHTML = "Todos los campos son obligatorios.";
            return;
        }

        return await Registro(usua, pass, idPais);
    }

    async function DatoLogin(){
        let usua = document.querySelector("#login-user").value;
        let pass = document.querySelector("#login-password").value;

        if (!usua || !pass) {
            document.querySelector("#login-messageColor").setAttribute("color", "danger");
            document.querySelector("#login-message").innerHTML = "Todos los campos son obligatorios.";
            return;
        }

        return await Login(usua, pass);
    }

    function DatoAgregarRegistro(){
        let idActividad = document.querySelector("#addRecord-selectActivities ion-select").value;
        let tiempo = document.querySelector("#addRecord-time").value;
        let fecha = document.querySelector("#addRecord-date").value;
        let idUsuario = localStorage.getItem("iduser");

        // toISOString convierte la fecha a formato "yyyy-mm-ddT14:30:00.000Z"
        // split("T")[0] divide la fecha formateada en la letra T y toma el primer segmento
        let fechaActual = new Date().toISOString().split("T")[0];

        if (!idActividad || !tiempo || !fecha) {
            document.querySelector("#addRecord-messageColor").setAttribute("color", "danger");
            document.querySelector("#addRecord-message").innerHTML = "Todos los campos son obligatorios.";
            return;
        } else if (fecha > fechaActual) {
            document.querySelector("#addRecord-messageColor").setAttribute("color", "danger");
            document.querySelector("#addRecord-message").innerHTML = "La fecha no puede ser posterior al día actual.";
            return;
        }

        return AgregarRegistro(idActividad, tiempo, fecha, idUsuario);
    }

    // Consultas

    async function PoblarSelectPaises() {
        try {
            let response = await fetch(`${URL_BASE}paises.php`, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            console.log(response);
            console.log(data);
            
            if (data.codigo >= 200 && data.codigo < 300) {
                let selectContainer = document.querySelector("#register-selectCountries");
                let optionsHTML = "";
                
                for (let i = 0; i < data.paises.length; i++) {
                    let pais = data.paises[i];
                    optionsHTML += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`;
                }
                
                selectContainer.innerHTML = `
                    <ion-select label="País" label-placement="fixed" placeholder="Seleccionar">
                        ${optionsHTML}
                    </ion-select>
                `;
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    async function PoblarSelectActividades() {
        try {
            let response = await fetch(`${URL_BASE}actividades.php`, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("iduser")
                }
            });
            let data = await response.json();
            console.log(response);
            console.log(data);
            
            if (data.codigo >= 200 && data.codigo < 300) {
                let selectContainer = document.querySelector("#addRecord-selectActivities");
                let optionsHTML = "";
                
                for (let i = 0; i < data.actividades.length; i++) {
                    let actividad = data.actividades[i];
                    optionsHTML += `<ion-select-option value="${actividad.id}">${actividad.nombre}</ion-select-option>`;
                }
                
                selectContainer.innerHTML = `
                    <ion-select label="Actividad" label-placement="fixed" placeholder="Seleccionar">
                        ${optionsHTML}
                    </ion-select>
                `;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function ObtenerTiempoRegistros() {
        try {
            let idUsuario = localStorage.getItem("iduser");
            let response = await fetch(`${URL_BASE}registros.php?idUsuario=${idUsuario}`, {
                headers: {
                    "Content-Type":"application/json",
                    "apiKey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("iduser")
                }
            });
            let data = await response.json();
            console.log(response);
            console.log(data);

            if (data.codigo >= 200 && data.codigo < 300) {
                let tiempoRegistrosTodos = 0;
                let tiempoRegistrosHoy = 0;

                // toISOString convierte la fecha a formato "yyyy-mm-ddT14:30:00.000Z"
                // split("T")[0] divide la fecha formateada en la letra T y toma el primer segmento
                let fechaActual = new Date().toISOString().split("T")[0];
                
                for (let i = 0; i < data.registros.length; i++) {
                    let registro = data.registros[i];

                    tiempoRegistrosTodos += registro.tiempo;
                    if (registro.fecha == fechaActual) {
                        tiempoRegistrosHoy += registro.tiempo;
                    }
                }

                document.querySelector("#obtainRecord-TimeAllRecords").innerHTML = tiempoRegistrosTodos;
                document.querySelector("#obtainRecord-TimeDayRecords").innerHTML = tiempoRegistrosHoy;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function MarkersUsuariosPorPais(){
        try {
            // Realiza ambas peticiones de forma concurrente
            let [responsePaises, responseUsuariosPorPais] = await Promise.all([
                fetch(`${URL_BASE}paises.php`, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }),
                fetch(`${URL_BASE}usuariosPorPais.php`, {
                    headers: {
                        "Content-Type": "application/json",
                        "apiKey": localStorage.getItem("apiKey"),
                        "iduser": localStorage.getItem("iduser")
                    }
                })
            ]);
    
            // Convertimos las respuestas a JSON
            let dataPaises = await responsePaises.json();
            let dataUsuariosPorPais = await responseUsuariosPorPais.json();
            console.log(responsePaises);
            console.log(dataPaises);
            console.log(responseUsuariosPorPais);
            console.log(dataUsuariosPorPais);

            // Verificamos que ambas respuestas sean exitosas
            if (dataUsuariosPorPais.codigo >= 200 && dataUsuariosPorPais.codigo < 300 &&
                dataPaises.codigo >= 200 && dataPaises.codigo < 300) {
                
                // Iteramos sobre cada país obtenido en la consulta de paises.php
                for (let i = 0; i < dataPaises.paises.length; i++) {
                    let pais = dataPaises.paises[i];
                    let hayUsuariosEnPais = false;

                    // Iteramos sobre cada país obtenido de la consulta usuariosPorPais.php
                    for (let j = 0; j < dataUsuariosPorPais.paises.length && !hayUsuariosEnPais; j++) {
                        let usuarioPais = dataUsuariosPorPais.paises[j];
                        
                        // Si el pais existe en ambas listas muestra un marcador con su nombre y cantidad de usuarios
                        if (pais.id == usuarioPais.id) {
                            hayUsuariosEnPais = true;

                            if (pais.latitude && pais.longitude) {
                                L.marker([pais.latitude, pais.longitude]).addTo(map)
                                    .bindTooltip(`${pais.name}: ${usuarioPais.cantidadDeUsuarios} usuarios`);
                            }
                        }
                    }
                };
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function Registro(usua, pass, idPais) {
        try {
            // Creación del objeto de registro
            let registro = new Object();
            registro.usuario = usua;
            registro.password = pass;
            registro.idPais = idPais;
    
            let response = await fetch(`${URL_BASE}usuarios.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registro)
            });
            console.log(response);
    
            let data = await response.json();
            console.log(data);
    
            if (data.codigo >= 200 && data.codigo < 300) {
                document.querySelector("#register-messageColor").setAttribute("color", "success");
                document.querySelector("#register-message").innerHTML = "";
                await Login(usua, pass);
            } else {
                document.querySelector("#register-messageColor").setAttribute("color", "danger");
                document.querySelector("#register-message").innerHTML = data.mensaje;
            }
    
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async function Login(usua, pass) {
        try {
            // Creación del objeto de login
            let login = new Object();
            login.usuario = usua;
            login.password = pass;
    
            let response = await fetch(`${URL_BASE}login.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(login)
            });
            console.log(response);
    
            let data = await response.json();
            console.log(data);
    
            if (data.codigo >= 200 && data.codigo < 300) {
                localStorage.setItem("apiKey", data.apiKey);
                localStorage.setItem("iduser", data.id);
                document.querySelector("#login-messageColor").setAttribute("color", "success");
                document.querySelector("#login-message").innerHTML = "";
            } else {
                document.querySelector("#login-messageColor").setAttribute("color", "danger");
                document.querySelector("#login-message").innerHTML = data.mensaje;
            }
    
            return data;
        } catch (error) {
            console.error(error);
        }
    }    

    async function ObtenerRegistros() {
        try {
            let idUsuario = localStorage.getItem("iduser");
            let response = await fetch(`${URL_BASE}registros.php?idUsuario=${idUsuario}`, {
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("iduser")
                }
            });
            console.log(response);
            let data = await response.json();
            console.log(data);
    
            if (data.codigo >= 200 && data.codigo < 300) {
                let tablaHTML = `
                    <table style="border-collapse: collapse; width: 100%; text-align: left;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid black; padding: 8px;">Id</th>
                                <th style="border: 1px solid black; padding: 8px;">Ícono</th>
                                <th style="border: 1px solid black; padding: 8px;">Id actividad</th>
                                <th style="border: 1px solid black; padding: 8px;">Id usuario</th>
                                <th style="border: 1px solid black; padding: 8px;">Fecha</th>
                                <th style="border: 1px solid black; padding: 8px;">Tiempo</th>
                                <th style="border: 1px solid black; padding: 8px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
                let fechaActual = new Date().toISOString().split("T")[0];
                let filtroSeleccionado = document.querySelector("#obtainRecord-dateFilter").value;
                let fechaActualObj = new Date(fechaActual);
    
                for (let i = 0; i < data.registros.length; i++) {
                    let registro = data.registros[i];
                    let cumpleConFiltro = false;
                    let registroFechaObj = new Date(registro.fecha);
    
                    if (filtroSeleccionado == "1") {
                        let haceUnaSemana = new Date(fechaActualObj);
                        haceUnaSemana.setDate(fechaActualObj.getDate() - 7);
                        if (registroFechaObj >= haceUnaSemana && registroFechaObj <= fechaActualObj) {
                            cumpleConFiltro = true;
                        }
                    } else if (filtroSeleccionado == "2") {
                        let haceUnMes = new Date(fechaActualObj);
                        haceUnMes.setDate(fechaActualObj.getDate() - 30);
                        if (registroFechaObj >= haceUnMes && registroFechaObj <= fechaActualObj) {
                            cumpleConFiltro = true;
                        }
                    } else {
                        cumpleConFiltro = true;
                    }
    
                    if (cumpleConFiltro) {
                        tablaHTML += `
                            <tr>
                                <td style="border: 1px solid black; padding: 8px;">${registro.id}</td>
                                <td style="border: 1px solid black; padding: 8px;">
                                    <img src="${URL_IMAGENES}${registro.idActividad}.png" alt="Ícono" style="width:32px; height:32px;">
                                </td>
                                <td style="border: 1px solid black; padding: 8px;">${registro.idActividad}</td>
                                <td style="border: 1px solid black; padding: 8px;">${registro.idUsuario}</td>
                                <td style="border: 1px solid black; padding: 8px;">${registro.fecha}</td>
                                <td style="border: 1px solid black; padding: 8px;">${registro.tiempo}</td>
                                <td style="border: 1px solid black; padding: 8px;">
                                    <button 
                                        type="button"
                                        style="background-color: #007bff; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
                                        onClick="EliminarRegistro(${registro.id})">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>`;
                    }
                }
    
                tablaHTML += `
                        </tbody>
                    </table>`;
    
                document.querySelector("#obtainRecord-tableRecords").innerHTML = tablaHTML;
            }
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    function AgregarRegistro(idActividad, tiempo, fecha, idUsuario){
        // Creación body
        let registro = new Object();
        registro.idActividad = idActividad;
        registro.idUsuario = idUsuario;
        registro.tiempo = tiempo;
        registro.fecha = fecha;

        fetch(`${URL_BASE}registros.php`, {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "apiKey": localStorage.getItem("apiKey"),
                "iduser": localStorage.getItem("iduser")
            },
            body:JSON.stringify(registro)
        })
        .then(function(response) {
            console.log(response);
            return response.json();
        }).then(function(data) {
            console.log(data);

            if (data.codigo >= 200 && data.codigo < 300) {
                document.querySelector("#addRecord-messageColor").setAttribute("color", "success");
                document.querySelector("#addRecord-message").innerHTML = "Registro realizado correctamente";
            } else {
                document.querySelector("#addRecord-messageColor").setAttribute("color", "danger");
                document.querySelector("#addRecord-message").innerHTML = data.mensaje;
            }
        })
        .catch(error => console.error(error));
    }

    function EliminarRegistro(idRegistro){
        fetch(`${URL_BASE}registros.php?idRegistro=${idRegistro}`, {
            method: "DELETE",
            headers: {
                "Content-Type":"application/json",
                "apiKey": localStorage.getItem("apiKey"),
                "iduser": localStorage.getItem("iduser")
            }
        })
        .then(function(response) {
            console.log(response);
            return response.json();
        }).then(function(data) {
            console.log(data);
            // Una vez completada la eliminación, se refresca la tabla
            ObtenerRegistros();
        })
        .catch(error => console.error(error));
    }
