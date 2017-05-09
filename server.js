var http = require("http");
var fs = require("fs");

var korisnici = []
var poruke = []

fs.readFile("korisnici.dat", function read(err, data) {
    if (err) {
        korisnici = [{ime:"admin",pin:"9999"}]
    }
    else korisnici = JSON.parse(data);
});

fs.readFile("poruke.dat", function read(err, data) {
    if (err) {
        poruke = [];
    }
    else poruke = JSON.parse(data);
});

// Keširanje statičkih fajlova
var index = fs.readFileSync("index.html","utf8");
var appcss = fs.readFileSync("app.css","utf8");
var appjs = fs.readFileSync("app.js","utf8");
var ikona = fs.readFileSync("favicon.ico");

function prikaziPocetnuStranu(response){
  response.writeHead(200, {"Content-Type": "text/html"});
  response.end(index);
} 

function loginKorisnika(korisnik){
  if (korisnikRegistrovan(korisnik)){
    return "Registrovan"
  }
  else{
    return "Niste registrovani korisnik"
  }
}

function korisnikRegistrovan(korisnik){
    for (var i=0; i < korisnici.length; i++){
        if ( korisnici[i].ime == korisnik.ime && korisnici[i].pin == korisnik.pin ){
           return true
        }
    }
		return false
}

function registracijaKorisnika(korisnik) {
  
  if (imeRegistrovano(korisnik.ime)) {
    return "Ime je vec registrovano"
  }
  korisnici.push(korisnik)
  fs.writeFile("korisnici.dat", JSON.stringify(korisnici), function(err) {
		if(err) {
			console.log(err);
		}
	}); 
  return "Uspesna registracija"
} 

function imeRegistrovano(korisnik){
    for (var i=0; i < korisnici.length; i++){
        if ( korisnici[i].ime == korisnik){
           return true
        }
    }
		return false
}

function NovaPoruka(poruka){
  if (!imeRegistrovano(poruka.za)){
    return "Ne postoji korisnik "+poruka.za
  }
  poruke.push(poruka)
  //console.log(poruke)
  fs.writeFile("poruke.dat", JSON.stringify(poruke), function(err) {
		if(err) {
			console.log(err);
		}
	}); 

  return "Poruka poslata"
}

function Outbox(korisnik){
   odgovor="<p><b>Outbox</b></p>"
   for (i=0;i<poruke.length;i++){
      if(poruke[i].od == korisnik)
        odgovor += "<p><span class='ime'>"+poruke[i].za+": </span>"+poruke[i].poruka+"</p>"
   }
   return odgovor
}

function Inbox(korisnik){
   odgovor="<p><b>Inbox</b></p>"
   for (i=0;i<poruke.length;i++){
      if(poruke[i].za == korisnik)
        odgovor += "<p><span class='ime'>"+poruke[i].od+": </span>"+poruke[i].poruka+"</p>"
   }
   return odgovor
}

function nepoznatURL(response){
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<h1>Not Found</h1>");
  response.end();
}

function OdgovorNaZahtev(request,response){
  //console.log(request.url)
  switch(request.url) {
    case "/": 
    case "/index.html": 
              prikaziPocetnuStranu(response);
              break;
    case "/app.css":
              response.writeHead(200, {"Content-Type": "text/css"});
              response.end(appcss);
              break;
    case "/favicon.ico":
              response.writeHead(200, {'Content-Type': 'image/gif' });
        			response.end(ikona, 'binary');
              break;
    case "/app.js":
						  response.writeHead(200, {"Content-Type": "text/plain"});
	            response.end(appjs);
	            break;
		case "/login": 
              var korisnik = ""
	            request.on('data', function (data) {
	              korisnik += data;
	            });
	            request.on('end', function () { 
                korisnik = JSON.parse(korisnik)
	              response.end(loginKorisnika(korisnik));
	            });	
	            break;
    case "/registracija":
              var korisnik = ""
	            request.on('data', function (data) {
	              korisnik += data;
	            });
	            request.on('end', function () { 
                korisnik = JSON.parse(korisnik)
	              response.end(registracijaKorisnika(korisnik));
	            });	
	            break; 
    case "/nova-poruka":
              var poruka = ""
	            request.on('data', function (data) {
	              poruka += data;
	            });
	            request.on('end', function () { 
                poruka = JSON.parse(poruka)
	              response.end(NovaPoruka(poruka));
	            });	
	            break; 
    case "/outbox":
              var korisnik = ""
	            request.on('data', function (data) {
	              korisnik += data;
	            });
	            request.on('end', function () { 
	              response.end(Outbox(korisnik));
	            });	
	            break; 
    case "/inbox":
              var korisnik = ""
	            request.on('data', function (data) {
	              korisnik += data;
	            });
	            request.on('end', function () { 
	              response.end(Inbox(korisnik));
	            });	
	            break; 
	  default: 
	            nepoznatURL(response);
	            break;
	}
}

var server = http.createServer(OdgovorNaZahtev);
server.listen(8000);
console.log("Server ceka zahteve na portu 8000");
