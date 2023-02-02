const fs = require('fs');
const Papa = require('papaparse');
const { parse } = require('path');
const Spinner = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
const Loading = document.getElementById('loading');

let chart = document.getElementById('chart');
let PeakTableTab = document.getElementById('TableTab');
let AnalysisTab = document.getElementById('DefaultTab');


///FIX FILE LOADING

function License(){
    alert(`Designed by Jehad Nasereddin (C) ${new Date().getFullYear()}\n
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`
)
}

function About(){
    alert(`
    Ira FTIR data explorer
    Build number: 020223\n
    (C) Dr. Jehad Nasereddin
    Assistant Professor of Pharmaceutical Technology
    Zarqa University, 13110, Zarqa, JO
    Contact: jihad.nasereddin@gmail.com\n
    `)
}

//Triggers the file load process
document.getElementById('open').addEventListener('click', ()=>{
    LoadFile();
});


//<Tab Switching event handlers>
    PeakTableTab.addEventListener('click', ()=>{
        AnalysisTab.classList.remove('active');
        PeakTableTab.classList.add('active');
        document.getElementById('Tab1').style.visibility = 'hidden';
        document.getElementById('Tab2').style.visibility = 'visible';
    });
    AnalysisTab.addEventListener('click', ()=>{
        PeakTableTab.classList.remove('active');
        AnalysisTab.classList.add('active');
        document.getElementById('Tab1').style.visibility = 'visible';
        document.getElementById('Tab2').style.visibility = 'hidden';
    })
//</Tab Switching event handlers>


async function Save(){
    let Spectra = sessionStorage.getItem('Spectra');
    let thisDate = Date.now();

    const fileHandle = await self.showSaveFilePicker({
        suggestedName: `${thisDate}.iraspec`,
        types: [{
          accept: {
            'text/plain': ['.iraspec'],
          },
        }],
      });
      const fileStream = await fileHandle.createWritable();
      await fileStream.write(new Blob([Spectra], {type: "text/plain"}));
      await fileStream.close();
      alert('File saved successfully');
  
}

//Resets analysis and loads new file to view
function LoadFile(){
    document.getElementById('toolbar').style.visibility = 'visible';
    document.getElementById('sidebar').style.visibility = 'visible';
    let Spectra = sessionStorage.getItem('Spectra');
    let confirmation;
    if(Spectra !== null){
        confirmation = confirm('Are you sure you want to close the current view?\n\nIf you click "Ok", you will lose any unsaved data.\n\nTo add another graph to the current view please use the "Add Spectrum" button in the sidebar.\n\nPress "Ok" to close the current view or press "Cancel" to return');
        if(confirmation){
            sessionStorage.clear();
            document.getElementById('labeledPeaks').innerHTML = '';
            document.getElementById('CurveSelector').innerHTML = '<option class="form-control" disabled selected>Select Spectrum</option>'
        } else{
            return
        }
    }
  
    let file = document.getElementById('file');
    file.click();
    file.addEventListener('change', ()=>{
        let fileName = file.value.split('\\');
        document.getElementById('DefaultTab').innerText = 'New Analysis';
        let data;
        try {
            data = fs.readFileSync(file.value).toString();
        } catch (error) {
            Loading.innerHTML = '';
        }
        let extension = fileName[fileName.length - 1].split('.')[1];
        if(extension === 'iraspec'){
            LoadIraspec(data);
            return;
        }

        CSV = Papa.parse(data, 
            {
                header:false, 
                skipEmptyLines:true
        });    

        if(CSV.data[10].length < 2){
            data = delimit(CSV.data);
        } else{
            data = CSV.data;
        }

        
        data = cleaner(data); //Cleaner transforms the parsed array into an array of [x,y] coordinates and parses as float

        let xcoords = []
        let ycoords = []
        for(i in data){
            xcoords.push(data[i][0]);
            ycoords.push(data[i][1]);
        }

        let name = fileName[fileName.length - 1].split('.')[0];


        //Global spectrum object
        //The master object of this app
        //All functions in Ira manipulate the Spectrum object
        let newSpectrum = {
            x:xcoords,
            y:ycoords,
            name:name
        }


        //Spectra are stored in the sessionStorage object in an array called 'Spectra'
        let Spectra = [newSpectrum]
        sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
        sessionStorage.setItem('Raw', JSON.stringify(Spectra));
        Plot(Spectra);

    })
    

}

function LoadIraspec(data){
    data = JSON.parse(data);
    let Raw = JSON.parse(sessionStorage.getItem('Raw'));
    if(Raw !== null){
        alert('Opening an Iraspec file will start a new analysis session\n\nTo load Iraspec files with other file formats, you first have to load the Iraspec file first then append other CSV or TXT spectra');
    }
    sessionStorage.clear();
    Spectra = data;
    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);
}

//This append function is largely identical to the 'LoadFile'.
//Instead of overwriting the 'Spectra' array in sessionStorage it appends to it.
function AppendFile(){
    document.getElementById('toolbar').style.visibility = 'visible';
    document.getElementById('sidebar').style.visibility = 'visible';
    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));

    let file = document.getElementById('appendfile');
    file.click();
    file.addEventListener('change', ()=>{
        let fileName = file.value.split('\\');
        document.getElementById('DefaultTab').innerText = 'New Analysis';
        let data;
        try {
            data = fs.readFileSync(file.value).toString();
        } catch (error) {
            Loading.innerHTML = '';
        }
        let extension = fileName[fileName.length - 1].split('.')[1];
        if(extension === 'iraspec'){
            LoadIraspec(data);
            return;
        }

        CSV = Papa.parse(data, 
            {
                header:false, 
                skipEmptyLines:true
        });    

        if(CSV.data[10].length < 2){
            data = delimit(CSV.data);
        } else{
            data = CSV.data;
        }

        
        data = cleaner(data); //Cleaner transforms the parsed array into an array of [x,y] coordinates and parses as float

        let xcoords = []
        let ycoords = []
        for(i in data){
            xcoords.push(data[i][0]);
            ycoords.push(data[i][1]);
        }

        let name = fileName[fileName.length - 1].split('.')[0];


        //Global spectrum object
        //The master object of this app
        //All functions in Ira manipulate the Spectrum object
        let newSpectrum = {
            x:xcoords,
            y:ycoords,
            name:name
        }

        //Spectra are stored in the sessionStorage object in an array called 'Spectra'
        Spectra.push(newSpectrum);
        sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
        sessionStorage.setItem('Raw', JSON.stringify(Spectra));

        //Updates the CurveSelector dropdown in the "Peak Detection" side menu
        Plot(Spectra, Annotations);
    })
    
}

//Function that handles tab-delimited files.
function delimit(data){
    let newData = [];
    for(i in data){
        let string = data[i][0].trim();
        let splitString = string.split(' ');
        newData.push(splitString);
    }
    return newData;
}

//Cleaner function parses to Float and drops all NaN values (metadata) from file 
function cleaner(data){
    let parsed = [];
    for(i in data){
        let newRow = [];
        let row = data[i]
        for(j in row){
            if(!isNaN(parseFloat(row[j]))){
                newRow.push(parseFloat(row[j]));
            }
        }
        if(newRow.length == 2){
            parsed.push(newRow);
        }
    }

    return parsed;
}

//Updates the CurveSelector dropdown in the "Peak Detection" side menu
function UpdateCurveSelector(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    document.getElementById('CurveSelector').innerHTML = '<option class="form-control" disabled selected>Select Spectrum</option>'
    for(i in Spectra){
        let name = Spectra[i].name;
        name = name.split(' ');
        console.log(name[0]);
        if(name[0] !== 'AUC'){
            document.getElementById('CurveSelector').innerHTML += `<option value="${Spectra[i].name}">${Spectra[i].name}</option>`
        }
    }
}


//The flip function "transforms" the graph between absorbance and transmittance mode
//In reality, it flips the orientation of the Y-Axis between ascending and descending via
//assigning the global variable "flip"
function Flip(){
    let Annotations = sessionStorage.getItem('Annotations');
    let trace = sessionStorage.getItem('trace');

    if(trace !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('trace');
        document.getElementById('labeledPeaks').innerHTML = ''

    }


    if(Annotations !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('Annotations');
        document.getElementById('labeledPeaks').innerHTML = ''

    }

    let Spectra = JSON.parse(sessionStorage.getItem('Raw'));
    for(i in Spectra){
        let max = Math.max(...Spectra[i].y)
        if(max > 50){
            for(j in Spectra[i].y){
                Spectra[i].y[j] = 2 - Math.log(Spectra[i].y[j])
            }    
        } else if(max < 50){
            for(j in Spectra[i].y){
                Spectra[i].y[j] = Math.pow(10, (2-Spectra[i].y[j]))
            }    
        }
    }

    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);
}

//Peak detection algorithm
//Input is a min and a max number 
//Algorithm gets the indices of the min and max numbers in the X-Axis array, then adds the Y-Axis values between those two indices into a test array then gets the index of the largest number in that array then plots the X-value corresponding to that index and plots it as an annotation
//Annotations are stored in the "Annotations" object
function ScanPeaks(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));
    let Spectrum;
    if(Annotations === null){
        Annotations = [];
    }

    let target = document.getElementById('CurveSelector').value;
    if(target === 'Select Spectrum'){
        alert('Please select the spectrum you wish to analyze');
    }
    let from = parseFloat(document.getElementById('min').value);
    let to = parseFloat(document.getElementById('max').value);
    if(from > to){
        alert('You need to set the ranges correctly\n\nMinimum value cannot exceed maximum value');
    }
    for(i in Spectra){
        if(Spectra[i].name === target){
            Spectrum = Spectra[i];
        }
    }

    for(i in Spectrum.x){
        Spectrum.x[i] = parseFloat(Spectrum.x[i]);
        Spectrum.y[i] = parseFloat(Spectrum.y[i]);
    }


    let x = Spectrum.x;
    let y = Spectrum.y;
        let indices = [];


        for(i in x){
            if(parseFloat(x[i]) > parseFloat(from)){
                if(parseFloat(x[i]) < parseFloat(to)){
                    indices.push(i);
                }
            }
        }
        let TestArray;
        let Raw = JSON.parse(sessionStorage.getItem('Spectra'));
        for(i in Raw){
            if(Raw[i].name === target){
                TestArray = Raw[i].y;
            }
        }

        let max = (Math.max(...TestArray));
        if(max > 50){
            peak = 100
            x.filter((item)=>{
                if(parseFloat(item) > parseFloat(from) && parseFloat(item) < parseFloat(to)){
                    let index = (x.indexOf(item));
                    let abs = parseFloat(y[index])
                    if(abs < peak){
                        peak = abs;
                        target = index;
                    }
                };
            })


        } else{
            peak = 0
            x.filter((item)=>{
                if(parseFloat(item) > parseFloat(from) && parseFloat(item) < parseFloat(to)){
                    let index = (x.indexOf(item));
                    let abs = parseFloat(y[index])
                    if(abs > peak){
                        peak = abs;
                        target = index;
                    }
                };
            })
        }
        console.log(target);

        let Annotation;
        let FoundPeak;
        try {
            FoundPeak = parseFloat(x[target].toFixed(1));
    
            Annotation = {
                x:FoundPeak,
                y:peak,
                text:`${FoundPeak} [1/cm]`,
                showarrow:true
            }
        } catch (error) {
            alert("An unexpected error has occurred\n\nPlease reset your spectra and try again");
        }
    
        Annotations.push(Annotation);
        sessionStorage.setItem('Annotations', JSON.stringify(Annotations));


        document.getElementById('labeledPeaks').innerHTML += 
        `<sup><p id="${x[target]}">Peak: ${FoundPeak} [1/cm] &nbsp; <button class="btn btn-default btn-mini" onclick="ClearTag(${x[target]})"><span class="icon icon-minus-circled"></span></button></p><sup>`

        Plot(Spectra, Annotations);

}


function PeakArea(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));
    let Spectrum;
    if(Annotations === null){
        Annotations = [];
    }

    let target = document.getElementById('CurveSelector').value;
    if(target === 'Select Spectrum'){
        alert('Please select the spectrum you wish to analyze');
    }
    let from = parseFloat(document.getElementById('min').value);
    let to = parseFloat(document.getElementById('max').value);
    if(from > to){
        alert('You need to set the ranges correctly\n\nMinimum value cannot exceed maximum value');
    }
    for(i in Spectra){
        if(Spectra[i].name === target){
            Spectrum = Spectra[i];
        }
    }

    for(i in Spectrum.x){
        Spectrum.x[i] = parseFloat(Spectrum.x[i]);
        Spectrum.y[i] = parseFloat(Spectrum.y[i]);
    }


    let x = Spectrum.x;
    let y = Spectrum.y;

    console.log(`Integrating from ${from} to ${to}`);
    let peak = [];

    for(i in x){
        if(x[i] >= from){
            if(x[i] <= to){
                peak.push([x[i], y[i]]);
            }
        }
    }

    let slices = peak.length;
    let width = to - from; 
    let sliceWidth = slices/width;

    let peakX = [];
    let peakY = [];
    let cumsum = 0
    for(i in peak){
        let sliceArea = sliceWidth * peak[i][1];
        cumsum += (sliceArea);
        peakX.push(peak[i][0]);
        peakY.push(peak[i][1]);
    }

    console.log(Math.abs(cumsum));

    let peakArea = Math.round(cumsum, 2);

    let data = {
        x: peakX,
        y: peakY,
        fill: 'toself',
        hoveron: 'points+fills',
        text: `Peak Area = ${peakArea} Area Units`,
        hoverinfo: 'text',
        name:`AUC = ${peakArea} AU`,
    };


    document.getElementById('labeledPeaks').innerHTML +=
    `<sup><p id="${Math.round(peakArea)}"> ${target} Peak Area = ${peakArea} Area Units &nbsp;<button class="btn btn-default btn-mini" onclick="RemoveAUC(${peakArea})"><span class="icon icon-minus-circled"></span></button></p><sup>
    `
    Spectra.push(data);
    console.log(Spectra);
    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);

}


function RemoveAUC(target){
    target = Math.round(target);
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));

    for(i in Spectra){
        if(Spectra[i].fill == 'toself'){
            name = Spectra[i].name.split(' ')[2];
            console.log(name);
            console.log(target);

            if(name == target){
                Spectra.splice(i, 1);
                Plot(Spectra);
            }
        }
    }
    document.getElementById(target).innerHTML = '';
    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);
}

//deletes an Annotation/peak label on button press
function ClearTag(target){
    document.getElementById(target).remove();
    target = `${target} [1/cm]`

    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));

    for(i in Annotations){
        if(Annotations[i].text === target){
            Annotations.splice(i, 1)
        } 
    }
    sessionStorage.setItem('Annotations', JSON.stringify(Annotations));
    if(Annotations.length === 0){
        sessionStorage.removeItem('Annotations');
    }

    Plot(Spectra, Annotations);
}

function Unset(target){
    document.getElementById(target).remove();
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));

    if(Annotations === null){
        Annotations = [];
    }

    target = `${target} [1/cm]`
    let trace = JSON.parse(sessionStorage.getItem('trace'));

    for(i in trace){
        if(trace[i].name === target){
            trace.splice(i, 1);
        }
    }
    sessionStorage.setItem('trace', JSON.stringify(trace));
    if(trace.length === 0){
        sessionStorage.removeItem('trace');
    }

    Plot(Spectra, Annotations)

}


//Stacks spectra by adding a set number to each item in the Y-axis 
function Stack(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = sessionStorage.getItem('Annotations');
    let trace = sessionStorage.getItem('trace');

    if(trace !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('trace');
        document.getElementById('labeledPeaks').innerHTML = ''

    }


    if(Annotations !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('Annotations');
        document.getElementById('labeledPeaks').innerHTML = ''

    }

    for(i in Spectra){
        let sum = 0
        for(j in Spectra[i].y){
            sum = sum + Spectra[i].y[j];
        }
        let magnitude;
        let max = Math.max(...Spectra[i].y)
        let average = sum / Spectra[i].y.length;
        if(max > 50){
            magnitude = i * Math.abs(average) * parseFloat(`0.${i}`)
        } else {
            magnitude = `0.${i}`
        }
        for(j in Spectra[i].y){
            Spectra[i].y[j] = (parseFloat(Spectra[i].y[j])) + Math.abs(magnitude);
        }
    }

    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra, Annotations);
}

//Unstacks spectra by subtracting a set number to each item in the Y-axis 
function Unstack(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = sessionStorage.getItem('Annotations');
    let trace = sessionStorage.getItem('trace');

    if(trace !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('trace');
        document.getElementById('labeledPeaks').innerHTML = ''

    }


    if(Annotations !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('Annotations');
        document.getElementById('labeledPeaks').innerHTML = ''

    }

    for(i in Spectra){
        let sum = 0
        for(j in Spectra[i].y){
            sum = sum + Spectra[i].y[j];
        }
        let average = sum / Spectra[i].y.length;
        let max = Math.max(...Spectra[i].y)
        let magnitude;
        if(max > 50){
            magnitude = i * Math.abs(average) * parseFloat(`0.${i}`);
        } else {
            magnitude = `0.${i}`
        }
        for(j in Spectra[i].y){
            Spectra[i].y[j] = (parseFloat(Spectra[i].y[j])) - Math.abs(magnitude);
        }
    }

    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);

}

//Resets view to the raw format the files were in when loaded
function Reset(){
    
    let Spectra = JSON.parse(sessionStorage.getItem('Raw'));
    sessionStorage.removeItem('trace');
    sessionStorage.removeItem('Annotations');
    document.getElementById('labeledPeaks').innerHTML = '';
    Plot(Spectra);
    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));

}

function Normalize(){
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = sessionStorage.getItem('Annotations');
    let trace = sessionStorage.getItem('trace');

    if(trace !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('trace');
        document.getElementById('labeledPeaks').innerHTML = ''

    }


    if(Annotations !== null){
        alert('Stacking spectra will reset peak annotations');
        sessionStorage.removeItem('Annotations');
        document.getElementById('labeledPeaks').innerHTML = ''

    }

    for(i in Spectra){
        let min = Math.min(...Spectra[i].y);
        let span = min - Math.max(...Spectra[i].y);
        for(j in Spectra[i].y){
            Spectra[i].y[j] = (parseFloat(Spectra[i].y[j]) * -1 / Math.abs(parseFloat(span)) * -1);
            Spectra[i].y[j] = parseFloat(Spectra[i].y[j]) + (parseFloat(min) * (-1));

        }

    }
    sessionStorage.setItem('Spectra', JSON.stringify(Spectra));
    Plot(Spectra);

}

function addLabel(){
    let wavenumber = document.getElementById('wavenumber').value;
    let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
    let Annotations = JSON.parse(sessionStorage.getItem('Annotations'));
    let traces = JSON.parse(sessionStorage.getItem('trace'));

    if(traces === null){
        traces = [];
    }

    let y = [];
    let x = [];
    for(i in Spectra){
        for(j in Spectra[i].y){
            y.push(Spectra[i].y[j]);
            x.push(wavenumber);

        }
    }

    let trace = {
        x:x,
        y:y,
        mode:'lines',
        name:`${wavenumber} [1/cm]`,
        line:{
            dash:'dashdot',
            width:1
        }
    }
    traces.push(trace)
    sessionStorage.setItem('trace', JSON.stringify(traces));
    document.getElementById('labeledPeaks').innerHTML += 
    `
    <sup>
    <p id="${wavenumber}">Label: ${wavenumber} [1/cm] &nbsp; <button class="btn btn-default btn-mini" onclick="Unset(${wavenumber})"><span class="icon icon-minus-circled"></span></button></p>
    <sup>
    `

    Plot(Spectra, Annotations)

}

function find(value){
    let range = (value.childNodes[1].innerHTML);
    range = range.split('-');
    for(i in range){
        let wavenumber = (parseInt(range[i]));
        let Spectra = JSON.parse(sessionStorage.getItem('Spectra'));
        let Annotations = sessionStorage.getItem('Annotations');
        let traces = JSON.parse(sessionStorage.getItem('trace'));
    
        if(traces === null){
            traces = [];
        }
    
        let y = [];
        let x = [];
        for(i in Spectra){
            for(j in Spectra[i].y){
                y.push(Spectra[i].y[j]);
                x.push(wavenumber);
    
            }
        }
    
        let trace = {
            x:x,
            y:y,
            mode:'lines',
            name:`${wavenumber} [1/cm]`,
            line:{
                dash:'dashdot',
                width:1
            }
        }
        traces.push(trace)
        sessionStorage.setItem('trace', JSON.stringify(traces));
        document.getElementById('labeledPeaks').innerHTML += 
        `
        <sup>
        <p id="${wavenumber}">Label: ${wavenumber} [1/cm] &nbsp; <button class="btn btn-default btn-mini" onclick="Unset(${wavenumber})"><span class="icon icon-minus-circled"></span></button></p>
        <sup>
        `
        Plot(Spectra, Annotations);
        document.getElementById('DefaultTab').click();
        
    }
}

//Plot spectrum, updates the chart canvas with Spectral data every time its called with the argument containing the most up to date spectral data 
function Plot(Spectra, Annotations){
    UpdateCurveSelector();
    let trace = JSON.parse(sessionStorage.getItem('trace'));
    if(trace !== null){
        Spectra.push(trace);
        Spectra = Spectra.flat();
    }

    Plotly.newPlot(chart, 
        Spectra,
    {
        title:'New Dataset',
        showlegend:true,
        xaxis:{autorange:'reversed', title:{'text':'Wavenumbers [1/cm]'}, zeroline:false},
        yaxis:{zeroline:false},
        hovermode: 'closest',
        annotations:Annotations
        
    },
    {displayModeBar:true, displaylogo:false, responsive:true, scrollZoom:true, editable:true}
    );

}

