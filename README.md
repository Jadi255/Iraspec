# Ira FTIR Explorer 

Ira is a free and open source Javascript (NWJS) applet for exploring and rapidly analyzing FTIR data.
 
## Please cite: Jehad Nasereddin & Mohammad Shakib (2023) Ira: a free and open-source Fourier transform infrared (FTIR) data analysis widget for pharmaceutical applications, Analytical Letters, DOI: 10.1080/00032719.2023.2180516 [full article](https://www.tandfonline.com/eprint/UI7W5C9JCC5X4KQRTNNU/full?target=10.1080/00032719.2023.2180516)

## Installation

### Debugging 
Just download or clone the repo and run 'npm install' to install the dependencies (Papaparse and NWJS), then run 'npm start'. 

### Standalone EXE for usage
Available in the "Releases" side menu

## Usage
Ira expects .csv or .txt files, so you cannot load the data files exported directly from your spectrometer (.sp, .spc, etc...) as generated by the machine without first exporting to CSV or ASCII text. 


Sometimes if you get an error while it's trying to load that's because the csv file has some metadata it didn't expect, it does its best to clean it but if that doesn't work out you can help it out by trimming anything that isn't x,y coordinates.

#### A user manual is currently being developed and will be added to this repo ASAP. 

##### Known issues: 
Sometimes the peak detection tool will throw an error when trying to detect the peaks of stacked spectra plotted as %T. This issue occurs if you stack using **+Stack** for spectra acquired in transmittance. Stacking transmittance spectra is recommended by using the **-Stack** button.

### License: 
    Designed by Dr. Jehad Nasereddin
    Assistant Professor of Pharmaceutical Technology
    Zarqa University, 13110, Zarqa, JO
    Contact: jihad.nasereddin@gmail.com

**Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:**

1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3) Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

_THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE._



