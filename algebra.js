// Variables globales
let currentA = [];
let currentB = [];
let lastResult = [];

// TOAST Y RECORDATORIOS
function showToast(msg) {
    const toast = document.getElementById('toast'); 
    toast.textContent = msg; 
    toast.className = 'show'; 
    setTimeout(() => { toast.className = ''; }, 3000);
}

function showReminder(content) {
    const reminder = document.getElementById('reminder');
    document.getElementById('reminder-content').innerHTML = content; 
    reminder.classList.add('show'); 
    setTimeout(() => { reminder.classList.remove('show'); }, 8000);
}

// GENERAR MATRICES
function generateMatrices() {
    const rowsA = parseInt(document.getElementById('rowsA').value);
    const colsA = parseInt(document.getElementById('colsA').value);
    const rowsB = parseInt(document.getElementById('rowsB').value);
    const colsB = parseInt(document.getElementById('colsB').value);
    
    let html = '<h3>Matriz A</h3><div class="matrix-input matrix-A">';
    for(let i = 0; i < rowsA; i++) {
        for(let j = 0; j < colsA; j++) { html += `<input type="number" id="a-${i}-${j}" value="0">`; }
        html += '<br>';
    }
    html += '</div><h3>Matriz B</h3><div class="matrix-input matrix-B">';
    for(let i = 0; i < rowsB; i++) {
        for(let j = 0; j < colsB; j++) { html += `<input type="number" id="b-${i}-${j}" value="0">`; }
        html += '<br>';
    }
    html += '</div>'; 
    
    document.getElementById('matrices').innerHTML = html; 
    document.getElementById('result').innerHTML = '';
    
    currentA = readMatrix('A');
    currentB = readMatrix('B');
    
    showToast("Ingresa los valores en las matrices");
}

// LEER MATRICES
function readMatrix(matrix){
    const rows = parseInt(document.getElementById('rows' + matrix).value);
    const cols = parseInt(document.getElementById('cols' + matrix).value);
    let M = [];
    for(let i = 0; i < rows; i++){
        M[i] = [];
        for(let j = 0; j < cols; j++){
            let val = document.getElementById(`${matrix.toLowerCase()}-${i}-${j}`);
            M[i][j] = val && !isNaN(val.value) ? parseFloat(val.value) : 0;
        }
    }
    return M;
}

// FUNCIONES MATEMÁTICAS
function transposeMatrix(M) {
    let rows = M.length, cols = M[0].length, T = [];
    for(let i = 0; i < cols; i++){
        T[i] = [];
        for(let j = 0; j < rows; j++){ T[i][j] = M[j][i]; }
    }
    return T;
}

function determinant(M) {
    if(M.length === 1) return M[0][0];
    if(M.length === 2) return M[0][0]*M[1][1]-M[0][1]*M[1][0];
    let det = 0;
    for(let i = 0; i < M[0].length; i++){
        let sub = M.slice(1).map(r => r.filter((_, j) => j !== i));
        det += ((i % 2 === 0 ? 1 : -1) * M[0][i] * determinant(sub));
    }
    return det;
}

function inverseMatrix(M) {
    if(M.length !== M[0].length){ showToast("Matriz no cuadrada"); return null; }
    let det = determinant(M);
    if(det === 0){ showToast("Matriz no invertible"); return null; }
    let n = M.length;
    let I = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i===j ? 1 : 0));
    let A = M.map(r => r.slice());
    
    for(let i=0;i<n;i++){
        if(A[i][i]===0){
            let found=false;
            for(let j=i+1;j<n;j++){
                if(A[j][i]!==0){ [A[i],A[j]]=[A[j],A[i]]; [I[i],I[j]]=[I[j],I[i]]; found=true; break; }
            }
            if(!found) return null;
        }
        let f = A[i][i];
        for(let j=0;j<n;j++){ A[i][j]/=f; I[i][j]/=f; }
        for(let k=0;k<n;k++){
            if(k!==i){ let factor=A[k][i]; for(let j=0;j<n;j++){ A[k][j]-=factor*A[i][j]; I[k][j]-=factor*I[i][j]; } }
        }
    }
    return I;
}

function multiplyMatrices(A,B){
    let rA=A.length,cA=A[0].length,rB=B.length,cB=B[0].length;
    let R=Array.from({length:rA},()=>Array(cB).fill(0));
    for(let i=0;i<rA;i++){ for(let j=0;j<cB;j++){ for(let k=0;k<cA;k++){ R[i][j]+=A[i][k]*B[k][j]; } } }
    return R;
}

// CÁLCULOS
function calculate(op){
    currentA = readMatrix('A');
    currentB = readMatrix('B');
    let result=[];
    try{
        if(op==='sum'||op==='subtract'){
            if(currentA.length!==currentB.length||currentA[0].length!==currentB[0].length){
                showToast("Dimensiones inválidas");
                showReminder("<p>Para sumar/restar: matrices deben ser del mismo tamaño</p>"); 
                return;
            }
            result = currentA.map((row,i) => row.map((val,j) => op==='sum'?val+currentB[i][j]:val-currentB[i][j]));
        } else if(op==='multiply'){
            if(currentA[0].length !== currentB.length){
                showToast("Columnas A ≠ filas B");
                showReminder("<p>Multiplicación: columnas A = filas B</p>"); 
                return;
            }
            result = multiplyMatrices(currentA, currentB);
        } else if(op==='determinant'){
            if(currentA.length !== currentA[0].length){
                showToast("Solo matrices cuadradas");
                showReminder("<p>Determinante solo para matrices cuadradas</p>");
                return;
            }
            let det = determinant(currentA);
            showToast("Determinante: "+det);
            showReminder("<p>Determinante calculado correctamente</p>");
            lastResult = [[det]];
            displayResult([[det]], "Determinante de A");
            return;
        }
        lastResult = result;
        displayResult(result,"Resultado de las dos matrices");
        showToast("Operación realizada con éxito");
    }catch(error){ showToast("Error: "+error.message); console.error(error); }
}

// MOSTRAR RESULTADO
function displayResult(matrix,label="Resultado"){
    if(!matrix) return;
    let html=`<h3>${label}</h3><div class="matrix-input matrix-result"><table>`;
    for(let i=0;i<matrix.length;i++){ html+='<tr>'; for(let j=0;j<matrix[i].length;j++){ html+=`<td>${Math.round(matrix[i][j]*10000)/10000}</td>`; } html+='</tr>'; }
    html+='</table></div>';
    const div = document.getElementById('result'); 
    div.innerHTML = html;
    const cells = div.querySelectorAll('td');
    cells.forEach((cell,index)=>{
        setTimeout(()=>{
            cell.classList.add('show');
            cell.style.backgroundColor=`hsl(${(index*30)%360},70%,80%)`;
            setTimeout(()=>{
                cell.style.backgroundColor='';
                cell.classList.add('highlight');
                setTimeout(()=>cell.classList.remove('highlight'),500);
            },500);
        },index*100);
    });
}

// TRANSFORMAR RESULTADO
function applyResultOption(){
    const option = document.getElementById('resultOption').value;
    if(!lastResult||lastResult.length===0) return;
    let transformed = lastResult;
    if(option==='transpose') transformed = transposeMatrix(lastResult);
    else if(option==='inverse'){ transformed = inverseMatrix(lastResult); if(!transformed) return; }
    else if(option==='determinant'){ if(lastResult.length!==lastResult[0].length){ showToast("Determinante solo para matrices cuadradas"); return; } transformed = [[determinant(lastResult)]]; }
    displayResult(transformed,"Resultado de las dos matrices ("+option+")");
}

// INICIALIZACIÓN
window.onload = generateMatrices;
