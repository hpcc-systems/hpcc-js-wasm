import { runAllTests } from './browser-test-utils.js';

console.log('Testing with Webpack bundler in browser...');
runAllTests().then(success => {
    if (success) {
        document.body.innerHTML += '<div style="color: green; font-size: 18px; margin: 20px;">✅ All Webpack browser tests passed!</div>';
    } else {
        document.body.innerHTML += '<div style="color: red; font-size: 18px; margin: 20px;">❌ Some Webpack browser tests failed!</div>';
    }
}).catch(error => {
    console.error('Test execution failed:', error);
    document.body.innerHTML += `<div style="color: red; font-size: 18px; margin: 20px;">❌ Webpack browser tests crashed: ${error.message}</div>`;
});
