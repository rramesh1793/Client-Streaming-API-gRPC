var greets = require('../server/protos/greet_pb')
var service = require('../server/protos/greet_grpc_pb')


var grpc = require('grpc')



function greetManyTimes(call, callback) {
    var firstName = call.request.getGreeting().getFirstName();

    let count = 0, 
    intervalID = setInterval(function(){

    var greetManyTimesResponse = new greets.GreetManyTimesResponse() //setting response and passing to call function to write
    greetManyTimesResponse.setResult(firstName)  //got this from call.request object

// setup streaming
call.write(greetManyTimesResponse);
if (++count>9) {

    clearInterval(intervalID)

    call.end() //we have sent all messages! 
}

    }, 1000);  //sleep for 1000ms - 1sec before next interval starts

}

function longGreet(call, callback) {
    call.on("data", request => {
      var fullName = request.getGreet().getFirstName() +
        " " +
        request.getGreet().getLastName();
  
      console.log("Hello " + fullName);
    });
  
    call.on("error", error => {
      console.error(error);
    });
  
    call.on("end", () => {
      var response = new greets.LongGreetResponse();
      response.setResult("Long Greet Client Streaming.....");
  
      callback(null, response); //finalize response
    });
  }




/* Following implements Greet RPC method */

function greet(call, callback) {

    var greeting = new greets.GreetResponse()  //from greet_pb

    greeting.setResult(
        "Hello"+call.request.getGreeting().getFirstName() + '' + call.request.getGreeting().getLastName()
    
    )

    callback(null, greeting)  

}


function main(){
    var server = new grpc.Server()
    server.addService(service.GreetServiceService, {greet: greet, 
        greetManyTimes: greetManyTimes, longGreet:longGreet})  // service of GreetService - GreetServiceService (refer greet_grpc_pb)

    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())
    server.start()

    console.log("Server running on port 127.0.0.1:50051")




}

main()