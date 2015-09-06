hake = [[{x:3000,y:3000,z:3000,name:"shake"},{x:100,y:100,z:100}],[{x:3000,y:3000,z:3000},{x:100,y:100,z:100}],[{x:3000,y:3000,z:3000},{x:100,y:100,z:100}]];//,[{x:3000,y:3000,z:3000},{x:100,y:100,z:100}]];
var shakeX =[[{x:4000,y:4000,z:4000,name:"shakeX"},{x:1100,y:0,z:0}]];
var shakeY =[[{x:4000,y:4000,z:4000,name:"shakeY"},{x:0,y:1100,z:0}]];
var shakeZ =[[{x:4000,y:4000,z:4000,name:"shakeZ"},{x:0,y:0,z:1100}]];
var xMove = [[{x:1000,y:100,z:100,name:"XMove"},{x:150,y:0,z:0}],[{x:1000,y:100,z:100},{x:150,y:0,z:0}],[{x:1000,y:100,z:100},{x:150,y:0,z:0}]];//,[{x:1000,y:100,z:100},{x:150,y:0,z:0}]];
var yMove = [[{x:100,y:1000,z:100,name:"YMove"},{x:0,y:150,z:0}],[{x:100,y:1000,z:100},{x:0,y:150,z:0}],[{x:100,y:1000,z:100},{x:0,y:150,z:0}]];//,[{x:100,y:1000,z:100},{x:0,y:150,z:0}]];
var zMove = [[{x:100,y:100,z:1000,name:"ZMove"},{x:20,y:20,z:150}],[{x:50,y:50,z:1000},{x:30,y:30,z:150}],[{x:80,y:80,z:1000},{x:30,y:30,z:150}]];//,[{x:80,y:80,z:1000},{x:30,y:30,z:150}]];
//Array of gestures, sorted by priority
var gesture = [shake,shakeX,shakeY,shakeZ,xMove,yMove,zMove];
var timeOfFrame = 0;
var defaultTimeDifference = 3000;
var defaultDebug = true;
var options = null;
//intialise AcellerometerLibary
var Accel = require('ui/accel');
var cachedFrameArray =[];
var stepArray = [];
var maxLengthGes = 0;

//Create Libary Object
function init(opts){
   options = opts || {}; 
   options.debug = opts.debug || defaultDebug;
   options.delay = opts.delay || defaultTimeDifference;
   options.gestures = opts.gestures || gesture;
}

//Get Values for Acelerometer
function startDetection(e){
   var frameArray = [];
   maximumGestureLength();
   frameArray = arrayToFrames(e);
   console.log("going to join");
   joinFrameArrays(frameArray);
   console.log(JSON.stringify(stepArray));
   cachedFrameArray = frameArray;
   if (timeOfFrame===0||frameArray[0][0].time - timeOfFrame >= options.delay){
      var detection = detectGesture(frameArray);
      var detectionJoin;
      //detection over the joining of the previous Arrays
      //try catch is used on the first time of joining when no previous cached array exists
      try{
         for ( var i=0; i<stepArray.length-1; i++){
            detectionJoin = detectGesture(stepArray[i]);
            if (detectionJoin[0]===true){
              if(options.debug){console.log(JSON.stringify(stepArray[i]));}
               break;
            }          
         }       
         Accel.config({subscribe: true});
         if (detectionJoin[0]===true){
            return detectionJoin;
         }
      }catch(arg){
         if(options.debug){console.log("First Frame Array, no join needed");}
      }    
      //dectection over the frame array
      if (detection[0]===true){
         if(options.debug){console.log(JSON.stringify(frameArray));}
      }
         Accel.config({subscribe: true}); 
         return(detection);
   }
   else{
      if(options.debug){console.log("On time out");}
      return[false,-1];
   }    
}

//Convert the arrays into frames, so they can be processed
function arrayToFrames(e){
   var frameArray = [];
   for ( var i=0; i<e.accels.length-1; i++){
      frameArray.push([e.accels[i],e.accels[i+1]]);
   }
   return (frameArray);
}

//function to join to arrays together, uses the cached and current arrays
function joinFrameArrays(current){
   stepArray=[];
   //if there is no previous cached array, the first time the app is started this process is voided
   if (cachedFrameArray === null){
      if(options.debug){console.log("First Frame Array, no join needed");}
   }
   else{
      //Create the temp stepped Array
      var tempArray = [];
      for (var i=maxLengthGes-1; i>=0; i--){
         // adding the frames from previous counting up to the end for the right order
         for(var j=0; j<i; j++){         
         tempArray.push(cachedFrameArray[cachedFrameArray.length-(i-j)]);
         }
         //Adding the frames from the current array
         for(j=0; j<maxLengthGes-i; j++){
            tempArray.push(current[j]);
         }
         //push this loops array to the stepArray
         stepArray.push(tempArray);
         //temp array cleard for the next loop
         tempArray =[];
      }
      if(options.debug){console.log("stepArray completeted");}
   }
}

//find maximum length gesture
function maximumGestureLength(){
   //loop over the getures array only taking the biggest overall array size
   for (var i=0, gesLength = options.gestures.length-1; i<gesLength; i++){
      if (options.gestures[i].length > maxLengthGes ){
         //take the largest gesture length
         maxLengthGes=gesture[i].length;
      }
   }
}

//function/algorithm that detects the gestures
function detectGesture(frameArray){ 
   for (var i=0, framelength = frameArray.length-maxLengthGes;  i<=framelength; i++){
      //look at the vibration setting in the frame array
      if ((frameArray[i][0].vibe === true)||(frameArray[i][0].vibe === true)){
         //debug mode ooption print outs
         if(options.debug){console.log("frame " + i + "failed" );}
      }
      else{
         //iterate over the gesture
         for(var k=0, overall = options.gestures.length-1; k <= overall; k++){
            //continue oover the frame array if a correct frame is detected
            for (var j=0, len = (options.gestures[k]).length-1; j <= len; j++){
               //vomparing tolerances for x,y,z upper and lower values
               if (((Math.abs(frameArray[i+j][1].z-frameArray[i][0].z)>=options.gestures[k][j][1].z)&&
                (Math.abs(frameArray[i+j][1].y-frameArray[i+j][0].y)>=options.gestures[k][j][1].y)&&
                (Math.abs(frameArray[i+j][1].x-frameArray[i+j][0].x)>=options.gestures[k][j][1].x))&&
                ((Math.abs(frameArray[i+j][0].z-frameArray[i+j][0].z)<=options.gestures[k][j][0].z)&&
                (Math.abs(frameArray[i+j][0].y-frameArray[i+j][0].y)<=options.gestures[k][j][0].y)&&
                (Math.abs(frameArray[i+j][0].x-frameArray[i+j][0].x)<=options.gestures[k][j][0].x))){
                  //if on the last frame return value and print messages (if debug is enabled)
                  if (len === j){
                     if(options.debug){console.log("Last Dectection Frame: "+(i+j) );}
                     if(options.debug){console.log("Gesture Frame: "+j);}
                     if(options.debug){console.log("Detection on: " +options.gestures[k][0][0].name);}
                     Accel.config({subscribe: false}); 
                     //take the time of the first frame that was detected on                                      
                     timeOfFrame = frameArray[i][0].time;
                     return [true,k];
                  }
                  else{
                     //printed when a frame has been evaluted as true
                     if(options.debug){console.log("Frame: "+(i+j) );}
                     if(options.debug){console.log("Gesture Frame: "+j);}
                  }
               }
               else{
                  //next frame
                  i=i+j;
                  break;
               }
            }
            
         }
      }      
   }
   //frame array has no gesture detected exit and return a false value
   return [false,-1] ;  
}
//export module methods
module.exports = {
   init: init,
   detect: startDetection,
   arrayToFrames: arrayToFrames,
   processFrames: detectGesture   
};
