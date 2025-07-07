verificaAutenticado();

const modPresenca = document.getElementById('mod-presenca');
const tbodyPresenca = document.getElementById("tbodyPresenca");

const getConsultasBD = async (valuePacienteFiltrado) => {
    const response = await fetch("/agendamentos_filtrado?id=" + valuePacienteFiltrado, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    itemsPresenca = await response.json();
    itemsPresenca.map(arg => {
        arg.Nome = todosPacientes.find(({ id }) => id === arg.Nome).Nome;
        return arg;
    });
};

async function carregarLista(force) {
    if (newCurrentDay === currentDayLista && force === undefined) return
    currentDayLista = newCurrentDay

    generateNewList()

    const cD = (currentDayLista.getDate()).toString().padStart(2, '0')
    const cM = (currentDayLista.getMonth() + 1).toString().padStart(2, '0')
    const cY = currentDayLista.getFullYear().toString().padStart(2, '0')

    const response = await fetch('/agendamentos')
    let data = await response.json()

    data = data.filter(arg =>
        arg.Data_do_Atendimento === `${cY}-${cM}-${cD}` &&
        arg.Especialista.toLowerCase().includes(document.getElementById("lista").value.toLowerCase())
    )


    data.forEach(arg => {
        const contentId = `agendamento-${arg.Horario_da_consulta}`;

        const contentEl = document.getElementById(contentId);


        if (contentEl) {

            contentEl.innerHTML = `${todosPacientes.find(pac => arg.Nome === pac.id)?.Nome} - Especialista: ${consultores.find(arg => arg.Usuario === list.value).Nome} - Observação: ${arg.observacao}`

            contentEl.style = 'cursor: pointer; user-select: none;'

            const lis = document.querySelectorAll("#olcards li");
            const startIndex = getIndexByDataMessage(`${arg.Horario_da_consulta}`);
            const endIndex = getIndexByDataMessage(`${arg.Horario_de_Termino_da_consulta}`);
           
            for (let i = startIndex; i <= endIndex && i < lis.length; i++) {
                let element = lis[i].firstElementChild;
                element.style = 'background-color: rgb(205, 205, 205);';
    
                // Adicionando mensagem de Horários Agendados apenas nos elementos cinza, exceto o horário de início
                if (i !== startIndex) {
                    const atendimentoMessage = document.createElement('div');
                    atendimentoMessage.innerText = 'Horário Ocupado';
                    atendimentoMessage.style = 'font-weight: bold; text-align: right;';
                    element.appendChild(atendimentoMessage);
                }
    
                // Adicionar borda ao elemento li
              
            }

            contentEl.onclick = () => {
                pacientesFiltrados = todosPacientes.filter(({ Especialista }) => Especialista === list.value)

                nameinp.innerHTML = ''
                pacientesFiltrados.forEach(item => {
                    nameinp.innerHTML += `<option value="${item.id}">${item.Nome}</option>`
                })

                age_name.disabled = true
                document.getElementById("btn-start-atendimento").style = "display:auto"


                modAgen.showModal()

                nameinp.value = arg.Nome
                phoneinp.value = arg.Telefone
                list.value = arg.Especialista
                data_atendimentoinp.value = arg.Data_do_Atendimento
                horario_consultainp.value = arg.Horario_da_consulta
                horariot_consultainp.value = arg.Horario_de_Termino_da_consulta
                valor_consultainpinp.value = arg.Valor_da_Consulta
                status_consultainp.value = arg.Status_da_Consulta
                status_pagamentoinp.value = arg.Status_do_pagamento
                observacaoinp.value = arg.observacao
                id_agendamento.value = arg.id

                document.getElementById("formagendamento").dataset.agendamentoid = arg.id
            }

        }

        const statusId = `status-${arg.Horario_da_consulta}`;
        const statusEl = document.getElementById(statusId);

        if (statusEl) {
            var statusFormated = arg.Status_da_Consulta.toLowerCase().replace(' ', '-')
            if (statusFormated.match("ã")) {
                statusFormated = statusFormated.replace("ã", "a");
            }
            if (statusFormated.match("ç")) {
                statusFormated = statusFormated.replace("ç", "c");
            }
            statusEl.classList.add(`status-${statusFormated}`);
        }
    })

}

function loadConsultas(event) {
    event.preventDefault();
    let pacienteFiltrado = document.getElementById("age_name_presenca");
    let valuePacienteFiltrado = pacienteFiltrado.value;
    getConsultasBD(valuePacienteFiltrado).then(() => {
        tbodyPresenca.innerHTML = "";
        itemsPresenca.forEach((item, index) => {
            insertItemPresenca(item, index);
        });
    }).catch(console.error);
}

let todosPacientes = [];

async function carregarPacientes() {
  const response = await fetch('/pacientes');
  todosPacientes = await response.json();
}

carregarPacientes().catch(console.error);


list.addEventListener("change", (e) => {
  if (list.value === "-") return;

  pacientesFiltradosPresenca = todosPacientes.filter(({ Especialista }) => Especialista === list.value);

  nameinppresenca.innerHTML = '';
  pacientesFiltradosPresenca.forEach(item => {
    nameinppresenca.innerHTML += `<option value="${item.id}">${item.Nome}</option>`;
  });
});


function insertItemPresenca(item, index) {
    let tr = document.createElement("tr");

    const date = new Date(item.Data_do_Atendimento);
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    const dataFormatada = adjustedDate.toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td id="${item.id}">${item.Nome}</td>
      <td>${dataFormatada}</td>
      <td>${item.Horario_da_consulta}</td>
      <td>${item.Horario_de_Termino_da_consulta}</td>
      <td>${item.Status_da_Consulta}</td>
      <td>${item.Status_do_pagamento}</td>
      <td class="columnAction">
        <button type="button" onclick='showModal(${JSON.stringify(item)})'>
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    `;

    tbodyPresenca.appendChild(tr);
}

function showModal(item) {
    document.getElementById("formagendamento").dataset.agendamentoid = item.id;

    const selectPaciente = document.getElementById('age_name');
    selectPaciente.innerHTML = '';

    const paciente = todosPacientes.find(({ Nome }) => Nome === item.Nome);

    if (paciente) {
        const option = document.createElement('option');
        option.value = paciente.id;
        option.text = paciente.Nome;
        selectPaciente.add(option);
        selectPaciente.value = paciente.id;

        selectPaciente.addEventListener('change', function () {
            const agendamentoId = document.getElementById("formagendamento").dataset.agendamentoid;
            const pacienteId = selectPaciente.value;

            document.getElementById('modalAgendamentoId').textContent = `Agendamento ID: ${agendamentoId}`;
            document.getElementById('modalPacienteId').textContent = `Paciente ID: ${pacienteId}`;

            enviarDadosParaServidor(agendamentoId, pacienteId);
        });
    }

    document.getElementById('phone').value = item.Telefone;
    document.getElementById('data_atendimento').value = item.Data_do_Atendimento;
    document.getElementById('horario_consulta').value = item.Horario_da_consulta;
    document.getElementById('horariot_consulta').value = item.Horario_de_Termino_da_consulta;
    document.getElementById('valor_consulta').value = item.Valor_da_Consulta;
    document.getElementById('status_pagamento').value = item.Status_do_pagamento;
    document.getElementById('status_c').value = item.Status_da_Consulta;
    document.getElementById('observacao').value = item.observacao;
    document.getElementById('id_agendamento').value = item.id;

    document.getElementById('mod-agen').style.display = "block";

    function enviarDadosParaServidor(agendamentoId, pacienteId) {
        const data = {
            id: agendamentoId,
            PacienteId: pacienteId,
            Telefone: document.getElementById('phone').value,
            Data_do_Atendimento: document.getElementById('data_atendimento').value,
            Horario_da_consulta: document.getElementById('horario_consulta').value,
            Horario_de_Termino_da_consulta: document.getElementById('horariot_consulta').value,
            Valor_da_Consulta: document.getElementById('valor_consulta').value,
            Status_do_pagamento: document.getElementById('status_pagamento').value,
            Status_da_Consulta: document.getElementById('status_c').value,
            observacao: document.getElementById('observacao').value
        };

        if (data.Status_da_Consulta === "Cancelado" && data.Status_do_pagamento === "Pago") {
            alert("Altere o Status do pagamento para 'Pendente' ou 'Cancelado' antes de atualizar.");
            return;
        }

        fetch("/agendamento", {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            alert("Paciente Atualizado com sucesso!");
            carregarLista(true).catch(console.error);
        })
        .catch(() => alert("Erro ao atualizar"));
    }
}

// BOTÃO VOLTAR (Substituto do antigo FECHAR)
document.getElementById('btn-voltar-presenca').addEventListener('click', function () {
    window.location.href = '../Menu/menu.html';
});

function deleteItemInDB(event, index) {
    fetch("/agendamento_desabilitado", {
        method: "PUT",
        body: JSON.stringify({
            id: index,
            Status_da_Consulta: "Cancelado",
            Status_do_pagamento: "Cancelado"
        }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json()).then(data => {
        loadConsultas(event);
    });
}

function deleteSelectedRows(event) {
    event.preventDefault();

    var table = document.getElementById("tablePresencas");
    var checkboxes = table.querySelectorAll("input[type='checkbox']:checked");

    checkboxes.forEach(function (checkbox) {
        var row = checkbox.parentNode.parentNode;
        var statusPagamentoCell = row.cells[6];
        var statusPagamento = statusPagamentoCell ? statusPagamentoCell.textContent.trim() : '';
        var parentTd = checkbox.parentElement;
        var nextTd = parentTd.nextElementSibling;
        var idDoElemento = nextTd ? nextTd.getAttribute('id') : '';

        if (statusPagamento === "Pago") {
            alert("Altere o Status do pagamento para 'Pendente' ou 'Cancelado'.");
        } else {
            deleteItemInDB(event, idDoElemento);
            alert("Agendamento cancelado com sucesso!");
        }
    });
}

var elementos = document.getElementsByClassName('trashPresenca');

for (var i = 0; i < elementos.length; i++) {
    elementos[i].addEventListener('click', function (event) {
        event.preventDefault();
        // Ação personalizada para o ícone de lixeira, se necessário
    });
}

function AbrirPresenca() {
    if (list.value === "-") {
        alert("Selecione o Especialista");
        return;
    }
    modPresenca.style.display = "block";
}

let pacientesFiltradosPresenca = [];
const nameinppresenca = document.getElementById("age_name_presenca");

document.getElementById('presenca').addEventListener('click', () => {
    if (list.value === "-") {
        return;
    }

    pacientesFiltradosPresenca = todosPacientes.filter(({ Especialista }) => Especialista === list.value);

    nameinppresenca.innerHTML = '';
    pacientesFiltradosPresenca.forEach(item => {
        nameinppresenca.innerHTML += `<option value="${item.id}">${item.Nome}</option>`;
    });

    modPresenca.style.display = "block";
});
