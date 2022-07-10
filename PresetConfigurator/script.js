function PresetConfigurator(presetName = 'Liquid_Heavy-Lifter', maxThrust = 1000, pitch = 1.0, secondaryMaxThrust = 2000)
{
    // no touch below this point
    let isMulti = presetName.endsWith("Multi");
    let volume = 1;
    let rawLoudness = -10;
    let rawLoudnessAdjusted = -10;

    let secondaryVolumeScale = 1.0;
    let secondaryRawLoudness = -10;
    let secondaryRawLoudnessAdjusted = -10;

    // Engine Samples and their loudness in LUFS with pitch change accounted for
    // Sample Name : 0.5 pitch , 1.0 pitch, 2.0 pitch
    let sampleLoudnessMap = {
        'Liquid_Heavy-Atm':     [-7.20,	-5.40, -4.50],
        'Liquid_Heavy-Vac':     [-7.10,	-5.30, -4.40],
        'Liquid_Medium-Atm':    [-9.50,	-7.70, -6.80],
        'Liquid_Medium-Vac':    [-9.70,	-7.90, -7.00],
        'Liquid_Light-Atm':     [-11.40,-9.90, -9.00],
        'Liquid_Light-Vac':     [-11.50, -10.00, -9.10],
        'SRB_Heavy':            [-6.00, -4.60, -3.80],
        'SRB_Medium':           [-6.50, -5.40, -4.50],
        'SRB_Light':            [-8.10, -7.10, -6.00],
    };
    
    // Engine Presets
    let presets = {
        'Liquid_Heavy-Lifter'       : sampleLoudnessMap['Liquid_Heavy-Atm'],
        'Liquid_Heavy-Sustainer'    : sampleLoudnessMap['Liquid_Heavy-Vac'],
        'Liquid_Heavy-Vacuum'       : sampleLoudnessMap['Liquid_Heavy-Vac'],
        'Liquid_Medium-Lifter'      : sampleLoudnessMap['Liquid_Medium-Atm'],
        'Liquid_Medium-Sustainer'   : sampleLoudnessMap['Liquid_Medium-Vac'],
        'Liquid_Medium-Vacuum'      : sampleLoudnessMap['Liquid_Medium-Vac'],
        'Liquid_Light-Atmosphere'   : sampleLoudnessMap['Liquid_Light-Atm'],
        'Liquid_Light-Atmosphere_1' : sampleLoudnessMap['Liquid_Light-Atm'],
        'Liquid_Light-Vacuum'       : sampleLoudnessMap['Liquid_Light-Vac'],
        'Liquid_Light-Vacuum_1'     : sampleLoudnessMap['Liquid_Light-Vac'],
        'SRB_Heavy'                 : sampleLoudnessMap['SRB_Heavy'],
        'SRB_Medium'                : sampleLoudnessMap['SRB_Medium'],
        'SRB_Light'                 : sampleLoudnessMap['SRB_Light'],
        'SRB_Light_1'               : sampleLoudnessMap['SRB_Light'],
        'Liquid_Heavy-Multi'    : [sampleLoudnessMap['Liquid_Heavy-Vac'], sampleLoudnessMap['Liquid_Heavy-Atm']],
        'Liquid_Medium-Multi'   : [sampleLoudnessMap['Liquid_Medium-Vac'], sampleLoudnessMap['Liquid_Medium-Atm']],
        'Liquid_Light-Multi'    : [sampleLoudnessMap['Liquid_Light-Vac'], sampleLoudnessMap['Liquid_Light-Atm']],
        'Liquid_Light-Multi_1'  : [sampleLoudnessMap['Liquid_Light-Vac'], sampleLoudnessMap['Liquid_Light-Atm']],
    };

    if (maxThrust < 1000)
        rawLoudness = lerp(100, 1000, -10, -5, maxThrust);
    else
        rawLoudness = lerp(1000, 5000, -5, 1, maxThrust);
        
    if (isMulti)
    {
        if (secondaryMaxThrust < 1000)
            secondaryRawLoudness = lerp(100, 1000, -10, -5, secondaryMaxThrust);
        else
            secondaryRawLoudness = lerp(1000, 5000, -5, 1, secondaryMaxThrust);
        if (pitch < 1)
        {
            rawLoudnessAdjusted =  lerp(0.5, 1.0, presets[presetName][0][0], presets[presetName][0][1], pitch);
            secondaryRawLoudnessAdjusted = lerp(0.5, 1.0, presets[presetName][1][0], presets[presetName][1][1], pitch);
        }
        else
        {
            rawLoudnessAdjusted = lerp(1.0, 2.0, presets[presetName][0][1], presets[presetName][0][2], pitch);
            secondaryRawLoudnessAdjusted = lerp(1.0, 2.0, presets[presetName][1][1], presets[presetName][1][2], pitch);
        }
    
        
        volume = Math.pow(10, (rawLoudness/20)) / Math.pow(10, (rawLoudnessAdjusted/20));
        let volume2 = Math.pow(10, (secondaryRawLoudness/20)) / Math.pow(10, (secondaryRawLoudnessAdjusted/20));
        secondaryVolumeScale = volume2 / volume;
    }
    else
    {
        if (pitch < 1)
            rawLoudnessAdjusted = rawLoudnessAdjusted = lerp(0.5, 1.0, presets[presetName][0], presets[presetName][1], pitch);
        else
            rawLoudnessAdjusted = lerp(1.0, 2.0, presets[presetName][1], presets[presetName][2], pitch);
    
        volume = Math.pow(10, (rawLoudness/20)) / Math.pow(10, (rawLoudnessAdjusted/20));
    }

    let config = "//   maxThrust: " + maxThrust.toFixed(2) + " kN | Loudness: " + rawLoudness.toFixed(2) + " LUFS";
    if (isMulti)
        config += "\n//   secondaryMaxThrust: " + secondaryMaxThrust.toFixed(2) + " kN | Loudness: " + secondaryRawLoudness.toFixed(2) + "LUFS";
        
    config += "\nRSE_PRESET\n{";
    config += "\n     name = " + presetName;
    config += "\n     volume = " + volume.toFixed(2);
    config += "\n     pitch = " + pitch.toFixed(2);
    if (isMulti)
        config += "\n     secondaryEngine_VolumeScale = " + secondaryVolumeScale.toFixed(2);
    config += "\n}";

    return config;
}

// x1 = key min, x2 = key max, y1 = value min, y2 = value max, input
function lerp(x1, x2, y1, y2, input)
{
    return y1 + (((input - x1) * (y2 - y1)) / (x2 - x1));
}