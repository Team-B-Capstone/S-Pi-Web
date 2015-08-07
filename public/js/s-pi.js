
function loadData() {
  id = window.location.hash.substring(1);
  loadPatient(id);
  for (i = 0; i < 4; i++) {
     patientsNavbar(i);
  }
}

function loadPatientPanels(id_string) {
  //console.log("Hi, this is the loadPatientPanelFunction");
  //var patient_id = id_string.split("-")[2];
  //loadPatientPanel(patient_id);

  for (i = 0; i < 4; i++) {
     loadPatientPanel(i);
     patientsNavbar(i);
  }
}

function loadPatientPanel(id) {
  $.getJSON('http://api.s-pi-demo.com/patients', function(data) {
    var patient_data = data[id+1];
    var patient_obj = $("#patient-" + id);
    patient_obj.find(".patient-name-text").html(patient_data["name"]);
    patient_obj.find(".patient-bed-number").html(patient_data["bed"]);
    patient_obj.find(".patient-temperature").html(patient_data["temperature"].toFixed(1));
    patient_obj.find(".patient-blood-pressure").html(patient_data["blood_pressure"]);
    patient_obj.find(".patient-heart-rate").html(patient_data["heart-rate"]);
  });
}

function loadPatient(id) {
  patient_id = parseInt(id) + 1
  $.getJSON('http://api.s-pi-demo.com/patients/'+patient_id, function(data) {
    $(document).prop('title', 'S-Pi Patient Information: ' + data["name"]);
    $( ".name-text").html(data["name"]);
    $( "#age").html(data["age"]);
    $( "#bed").html(data["bed"]);
    $( "#status").html(data["status"]);
  });
    
  $.getJSON('/patients.json', function(data) {
    patient_data = data['patients'][id];
    $( "div#dataModal .modal-body" ).html(patient_data['clinical-data']['html']);
    $( "div#labsModal .modal-body" ).html(patient_data['labs-data']['html']);
    $( "div#medsModal .modal-body" ).html(patient_data['meds-data']['html']);
    $( "div#progressModal .modal-body" ).html(patient_data['progress-data']['html']);
  } );
}

function patientsNavbar(id) {
  $.getJSON('http://api.s-pi-demo.com/patients', function(data) {
    var patient_data = data[id+1];
    var navbar_obj = $("#navbar-" + id);
    navbar_obj.find(".patient-name-navbar").html(patient_data["name"]);
  });
}
