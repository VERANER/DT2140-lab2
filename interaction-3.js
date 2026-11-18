//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "wind";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
wind.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
}

// Mapping 3: phone spun flat on a table -> wind (like a fan: faster spin, stronger wind)
let lastRotZ = null;   // Rotation Z in the previous frame
let spinLevel = 0;     // smoothed spinning speed

function rotationChange(rotx, roty, rotz) {
    if (!dspNode) return;
    let delta = 0;   // how much the phone turned since the last frame (radians)
    if (rotz !== null && rotz !== undefined) {   // no orientation data on a laptop or without permission
        if (lastRotZ !== null) {
            delta = rotz - lastRotZ;
            // Rotation Z wraps around (360 deg -> 0 deg): correct the jump so it is not read as a huge spin
            if (delta > PI) delta -= TWO_PI;
            if (delta < -PI) delta += TWO_PI;
        }
        lastRotZ = rotz;
    }
    spinLevel = 0.95 * spinLevel + 0.05 * Math.abs(delta);   // smoothing: the wind rises and dies down gradually
    // The wind model is only audible between ~0.5 and ~0.9 (at 1 its filter becomes unstable and very loud),
    // so the spinning speed is mapped into that range, and the wind is silent when the phone is still
    const amount = map(spinLevel, 0, 0.06, 0, 1, true);
    const force = amount < 0.05 ? 0 : 0.5 + 0.4 * amount;
    dspNode.setParamValue("/wind/wind/force", force);
    dspNode.setParamValue("/wind/volume", 1);
}

function mousePressed() {
    // Use this for debugging from the desktop: pretend the phone was spun fast, then the wind dies down
    spinLevel = 0.06;
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio() {
    // Not used in mapping 3: the wind is controlled continuously in rotationChange()
}

//==========================================================================================
// END
//==========================================================================================