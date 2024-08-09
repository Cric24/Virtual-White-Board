const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const clearButton = document.getElementById('clear');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserButton = document.getElementById('eraser');
const undoButton = document.getElementById('undo');
const shapeButton = document.getElementById('shape');
const shapeType = document.getElementById('shapeType');
const textToolButton = document.getElementById('textTool');
const toggleGridButton = document.getElementById('toggleGrid');
const toggleDarkModeButton = document.getElementById('toggleDarkMode');
const backgroundImageInput = document.getElementById('backgroundImage');
const saveButton = document.getElementById('save');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let painting = false;
let color = '#000';
let brushWidth = 5;
let isEraser = false;
let isShapeTool = false;
let isTextTool = false;
let actions = [];
let currentAction = -1;
let showGrid = false;
let isDarkMode = false;

function startPosition(e) {
    painting = true;
    if (isShapeTool) {
        drawShape(e);
    } else if (isTextTool) {
        addText(e);
    } else {
        addAction();
        draw(e);
    }
}

function endPosition() {
    painting = false;
    context.beginPath();
}

function draw(e) {
    if (!painting || isShapeTool || isTextTool) return;

    context.lineWidth = brushWidth;
    context.lineCap = 'round';
    context.strokeStyle = isEraser ? getComputedStyle(document.body).getPropertyValue('--background-color') : color;

    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    context.stroke();
    context.beginPath();
    context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function addAction() {
    actions = actions.slice(0, currentAction + 1);
    actions.push(canvas.toDataURL());
    currentAction++;
}

function undo() {
    if (currentAction > 0) {
        currentAction--;
        const img = new Image();
        img.src = actions[currentAction];
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
            if (showGrid) drawGrid();
        }
    }
}

function toggleGrid() {
    showGrid = !showGrid;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = actions[currentAction];
    img.onload = () => {
        context.drawImage(img, 0, 0);
        if (showGrid) drawGrid();
    }
}

function drawGrid() {
    const gridSize = 20;
    context.strokeStyle = isDarkMode ? '#444' : '#ddd';
    for (let x = 0; x < canvas.width; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
    }
    context.stroke();
}

function drawShape(e) {
    context.strokeStyle = color;
    context.lineWidth = brushWidth;
    context.beginPath();

    const startX = e.clientX - canvas.offsetLeft;
    const startY = e.clientY - canvas.offsetTop;

    switch (shapeType.value) {
        case 'rectangle':
            context.rect(startX, startY, 100, 50);
            break;
        case 'circle':
            context.arc(startX, startY, 50, 0, 2 * Math.PI);
            break;
        case 'line':
            context.moveTo(startX, startY);
            context.lineTo(startX + 100, startY + 50);
            break;
    }

    context.stroke();
    addAction();
}

function addText(e) {
    const text = prompt("Enter the text:");
    if (text) {
        context.font = `${brushWidth * 5}px Arial`;
        context.fillStyle = color;
        context.fillText(text, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        addAction();
    }
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

clearButton.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    actions = [];
    currentAction = -1;
    if (showGrid) drawGrid();
});

colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
    isEraser = false;
    isShapeTool = false;
    isTextTool = false;
});

brushSize.addEventListener('change', (e) => {
    brushWidth = e.target.value;
});

eraserButton.addEventListener('click', () => {
    isEraser = true;
    isShapeTool = false;
    isTextTool = false;
});

shapeButton.addEventListener('click', () => {
    isShapeTool = !isShapeTool;
    isEraser = false;
    isTextTool = false;
});

textToolButton.addEventListener('click', () => {
    isTextTool = !isTextTool;
    isEraser = false;
    isShapeTool = false;
});

undoButton.addEventListener('click', undo);
toggleGridButton.addEventListener('click', toggleGrid);

toggleDarkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    isDarkMode = !isDarkMode;
});

backgroundImageInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            addAction();
            if (showGrid) drawGrid();
        }
    }
    reader.readAsDataURL(e.target.files[0]);
});

saveButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
});
