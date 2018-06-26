const express = require("express");
const app = express()
const mysql = require("mysql")
const bodyParser= require('body-parser')
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

//const upload = multer({ dest: 'uploads/' })

var filename = '';
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
		crypto.pseudoRandomBytes(32,function(err,raw){
			filename = raw.toString('hex') + path.extname(file.originalname);
			cb(null, filename);
		})
      
    }
});
var upload = multer({storage: storage});

app.use("/bootstrap",express.static(__dirname+"/bootstrap"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')
app.use(express.static('public/images'));


con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password:'',
	database: 'node_mysql',
});

app.listen(3000,function(){
	console.log("Listening on 3000 ...");
});

app.get("/",function(req,res){
	con.query("select * from libro", function(error,result){
		res.render("index.ejs",{lista:result,message:0});
	});
});

app.get("/nuevo",function(req,res){
	res.render("nuevo.ejs",{});
});

app.post("/guardar", upload.any(),function(req,res){
	var titu = req.body.libro.titulo;
	var resu = req.body.libro.resumen;
	var img = filename;
	var fec = req.body.libro.fecha;
	con.query("insert into personaje (titulo,resumen,imagen,fecha) value (\""+titu+"\",\""+res+"\",\""+img+"\",\""+fec+"\")",function(error,result){
	});
	res.redirect("/");
});

app.get("/editar/:libroid",function(req,res){
	con.query("select * from libros where libro_id="+req.params.libroid,function(error,result){
		res.render("editar.ejs",{libro:result[0]});
	});
});

app.post("/actualizar",function(req,res){
	var id = req.body.libro.id;
	var titu = req.body.libro.titulo;
	var resu = req.body.libro.resumen;
	var img = req.body.libro.imagen;
	var fec = req.body.libro.fecha;
	con.query(" update libros set titulo=\""+titu+"\",resumen=\""+resu+"\",imagen=\""+img+"\",fecha=\""+fec+"\" where libro_id="+id,function(error,result){
	});
	res.redirect('/');
	
	
});

app.get("/eliminar/:libroid",function(req,res){
	con.query("delete from libros where libro_id="+req.params.libroid,function(error,result){
	});
	fs.unlink(__dirname+"/public/images"+filename, function(err) {
	if (err) {
	return console.error(err);
	}
	console.log('File deleted successfully!');
	});

	res.redirect("/");
});
