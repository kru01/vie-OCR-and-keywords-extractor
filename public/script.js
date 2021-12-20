const disableCovert = (() => {
    const convertButton = document.getElementById('convertButton');
    const input = document.querySelector('input');
    
    convertButton.disabled = true;
    
    input.addEventListener('change', () => {
        convertButton.disabled = false;
    });
})();