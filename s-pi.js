function updateAlertPanel(is_alert) {
  if (is_alert) {
    $("#infoArea .info-panel").removeClass("panel-success").addClass("panel-danger");
  }
  else {
    $("#infoArea .info-panel").removeClass("panel-danger").addClass("panel-success");
  }
}

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
  if (patient_id == 1) {
     img_source = "./images/Ann_Droid.jpg"
  } else if (patient_id == 2) {
     img_source = "./images/Mac_Intosh.jpg"
  } else if (patient_id == 3) {
     img_source = "./images/Mike_Rosoft.jpg"
  } else {
     img_source = "./images/Java_Script.jpg"
  }

  $.getJSON('http://api.s-pi-demo.com/patients/'+patient_id, function(data) {
    $(document).prop('title', 'S-Pi Patient Information: ' + data["name"]);
    $( "#patient-image").html("<img src='" + img_source + "' alt='Patient Image' width='100px'>");
    $( ".name-text").html(data["name"]);
    $( "#age").html(data["age"]);
    $( "#bed").html(data["bed"]);
    $( "#status").html(data["status"]);
    $( ".patient-id").html(data["patient_id"]);
    $( ".hospital-id").html(data["hospital_admission_id"]);
    $( ".case-id").html(data["case_id"]);
    $( ".weight-text").html(data["weight"]);
    $( ".height-text").html(data["height"]);
    $( ".allergies-text").html(data["allergies"]);   
    $( ".bp-text").html(data["blood_pressure"]); 
    $( ".temp").html(data["temperature"].toFixed(1)); 
    $( ".heart-rate-text").html(data["heart-rate"]); 
    if (data["cardiac"] == true) {
      $( ".cardiac-text").html("True");
    } else {
      $( ".cardiac-text").html("False");
    }

  });

  $.getJSON('/patients.json', function(data) {
    patient_data = data['patients'][id];
//    $( "div#dataModal .modal-body" ).html(patient_data['clinical-data']['html']);
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
