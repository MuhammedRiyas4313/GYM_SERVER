const { Server } = require('socket.io')

function socketConnection(server){
    console.log('socket connection calling')
    const io = new Server(server,{ 
        cors:{
          origin: 'https://master.d3e20f1ck916dk.amplifyapp.com',
          methods:["GET","POST"]
        }
      })

      
      io.on('connection',(socket)=>{

        
        console.log(`socket connection : ${socket.id}`)
       
        
        //socket for chat 

        socket.on('setup',(Id)=>{
          socket.join(123);
          console.log('socket join : ',Id)
          socket.emit('connected')
        })

        socket.on('send_message',(data)=>{
          socket.to(123).emit('recieve_message',data)
        })


        // socket for videocall

        socket.on('me',(conversation) => {
          socket.join(1234);
          console.log(conversation,'conversation id joined')
        })

        socket.on('disconnect',()=>{
          socket.broadcast.emit('callended')
        })
        socket.on('callended',(id)=>{
          socket.broadcast.to(1234).emit('callended',id)
          socket.leave(1234);
          console.log(id,'callended')
        })

        socket.on('calluser',({ userToCall, from , signalData, name })=>{
          socket.broadcast.to(1234).emit('calluser',{ signal: signalData, from , name })
        })

        socket.on('answercall',(data)=>{
          console.log('answercall on')
          io.to(1234).emit('callaccepted',data.signal)
        })



      })
}

module.exports = socketConnection;