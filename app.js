const e = require("express");
const express = require ("express");
const mongoose = require ("mongoose");

const app = express();

const uri = "mongodb+srv://nico:nico@cluster0.ca6e6.mongodb.net/tpnodejs?retryWrites=true&w=majority";

app.use(express.json());

async function conectar() {
    try{
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conectado a la base de datos metodo: mongoodb - async-await");
    }
    catch(e){
        console.log(e);
    }
};
conectar();

const GeneroSchema = new mongoose.Schema({
    name: String
});

const GeneroModel = mongoose.model("generos", GeneroSchema);


//creo el esquema
const LibroSchema = new mongoose.Schema({
    name: String,
    author: String,
    lended: String,
    gender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "generos"
    } 
    
});

//enlazo al Mongo
const LibroModel = mongoose.model("libros", LibroSchema);

app.get("/genero", async (req,res)=>{
    try{

        let respuesta= await GeneroModel.find();
        
        res.status(200).send(respuesta);

    }
    catch(e){
        console.log(e)
        res.status(422).send({error:e})
        
    }
});

app.get("/genero/:id", async (req,res)=>{
    try{

        let id = req.params.id;

        let respuesta = await GeneroModel.findById(id);

        res.status(200).send(respuesta);

    }
    catch(e){
        console.log(e)
        res.status(422).send({error:e})
        
    }
});

/*function capitalizeTxt(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); 
}*/


app.post("/genero", async (req,res)=>{
    try{


        let name = req.body.name;

        if(name == undefined){
            throw new Error ("Tiene que tener un nombre")
        };
        if(name ==""){
            throw new Error ("No puede estar vacío")
        };

        let existegenero= null;

        existegenero = await GeneroModel.find({name : name.toLowerCase()});

        if(existegenero.length >0){
            throw new Error ("Ya existe este género")
        };

        let genero = {
            name : name.toLowerCase()
        }

        await GeneroModel.create(genero);

        res.status(200).send(genero);

    }

    

    catch(e){
        console.log(e)
        res.status(422).send({error:e})
        
    }
});



app.post("/libro", async (req, res)=>{
    try{
        // verificacion de la info que recibo;
        let name = req.body.name;
        let author = req.body.author;
        let lended = req.body.lended;
        let gender = req.body.gender.toLowerCase();

        if(name == undefined){
            throw new Error("Error en nombre");
        }
        if(author == undefined){
            throw new Error("Error en autor");
        }
        if(gender == undefined){
            throw new Error("Error en género");
        }

        if(name == ''){
            throw new Error("Debe colocar un nombre");
        }
        if(author == ''){
            throw new Error("Debe colocar un autor");
        }

        if(gender == ''){
            throw new Error("Debe colocar un género");
        }

        let nameExiste = await LibroModel.find({name: name});
        if(nameExiste.length > 0){
            throw new Error("Libro ya cargado");
        }

        let generoexiste = await GeneroModel.findById(gender);
        if(generoexiste.length = 0){
            throw new Error ("Debe cargar antes el género");
        }

        let libro = {
            name: name,
            author: author,
            lended: lended,
            gender: gender.toLowerCase()
            
        }
        let LibroGuardado = await LibroModel.create(libro);
        console.log(LibroGuardado);
        res.status(200).send(LibroGuardado);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});

app.get("/libro", async (req,res)=>{
    try{
        let ListaLibros = await LibroModel.find();
        res.status(200).send(ListaLibros);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }

});

app.get("/libro/:id", async (req, res) => {
    try{
        let librobuscado = req.params.id
        let libro = await LibroModel.findById(librobuscado);
        res.status(200).send(libro);
        console.log(libro);
    }
    catch(e){
        console.log(e);
        res.status(422).send({error: e});
    }
});

app.put("/libro/:id", async (req,res)=>{
    try{
        
        let lended = req.body.lended;
        
        let modificado = {
            lended:lended
        };

        let cambio= await LibroModel.findByIdAndUpdate(req.params.id,modificado, {new:true});
        res.status(200).send(cambio);
    }
    catch{
        console.log(e);
        res.status(422).send({error:e});
    }
});

app.delete("libro/:id", async (req,res)=>{
    try{
        let id =req.params.id;

        let respuesta = await LibroModel.findByIdAndDelete(id);
        console.log(respuesta);
        res.status(200).send(respuesta);

    }
    catch(e){
        console.log(e);
        res.status(422).send({error:e});
    }
});

app.listen (3000, ()=>{
    console.log("servidor escuchando en el puerto 3000");
});

/*+ Metodos:
            para ruta "/libro" GET (ok check), GET para uno(ok check), POST (ok), DELETE (ok check), UPDATE (ok check) (solo se utiliza para indicar que un libro fue prestado o sacarlo de la situacion de prestamo, es decir, solo se tiene que poder modificar el campo lended o prestado, verificar al prestar un libro que ya no se encuentre prestado lo que significa que el lended sea vacio lended = '')
            para ruta "/genero" GET(ok), GET(ok) para uno, POST(ok)
 Aclaracion: en ambos POST verificar que ya no exista el dato.
+ Utilizar TRY-CATCH, NO OLVIDAR async-await*/
