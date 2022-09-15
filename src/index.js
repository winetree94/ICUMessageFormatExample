import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import MessageFormat from '@messageformat/core';
import { parse } from '@messageformat/parser';

new MessageFormat('en');

const $variableRoot = document.getElementById('variable-root');
const $languageInput = document.getElementById('language-input');
const $messageInput = document.getElementById('message-input');
const $resultRoot = document.getElementById('result-root');

$messageInput.addEventListener('input', showResult);
$languageInput.addEventListener('change', showResult);

function showResult() {
  const lang = $languageInput.value;
  const value = $messageInput.value;

  try {
    const messageFormat = new MessageFormat(lang);
    const fn = messageFormat.compile(value);

    const args = parse(value)
      .filter((content) => content.type !== 'content');
    $variableRoot.innerHTML = ``;

    const vars = {};

    args.forEach((arg) => {

      if (vars[arg.arg] !== undefined) {
        return;
      }

      const $row = document.createElement('div');
      $row.classList.add('row');

      const $name = document.createElement('h3');
      $name.innerHTML = arg.arg;
      $row.append($name);

      switch (arg.type) {
        case 'select':
          const $select = document.createElement('select');
          $select.classList.add('form-select');
          arg.cases.filter((selectCase) => selectCase.key !== 'other').forEach((selectCase, index) => {
            const $option = document.createElement('option');
            $option.value = selectCase.key;
            $option.textContent = selectCase.key;
            if (index === 0) {
              $option.selected = true;
            }
            $select.append($option);
          });
          $row.append($select);
          vars[arg.arg] = $select.value || '';
          $select.addEventListener('input', () => {
            vars[arg.arg] = $select.value || '';
            $resultRoot.innerHTML = fn(vars);
          });
          break;

        case 'plural':
          var $input = document.createElement('input');
          $input.type = 'number';
          $input.value = 0;
          $row.append($input);
          vars[arg.arg] = $input.value || '';
          $input.addEventListener('input', () => {
            vars[arg.arg] = $input.value || '';
            $resultRoot.innerHTML = fn(vars);
            delete vars[arg.arg];
            console.log(vars)
          });
          break;

        case 'function':
          switch (arg.key) {
            case 'date':
              var $input = document.createElement('input');
              $input.classList.add('form-input');
              $input.value = new Date().toISOString().slice(0, 10);
              $row.append($input);
              vars[arg.arg] = $input.value || '';
              $input.addEventListener('input', () => {
                vars[arg.arg] = $input.value || '';
                $resultRoot.innerHTML = fn(vars);
              })
              break;

            case 'number':
              var $input = document.createElement('input');
              $input.value = '';
              $row.append($input);
              vars[arg.arg] = $input.value || '';
              $input.addEventListener('input', () => {
                vars[arg.arg] = $input.value || '';
                $resultRoot.innerHTML = fn(vars);
              });
            break;
          }
          break;
        case 'argument':
          var $input = document.createElement('input');
          $input.classList.add('form-input');
          $row.append($input);
          vars[arg.arg] = $input.value || '';
          $input.addEventListener('input', () => {
            vars[arg.arg] = $input.value || '';
            $resultRoot.innerHTML = fn(vars);
          })
          break;
      }
      $variableRoot.append($row);
    });

    console.log(vars);

    $resultRoot.innerHTML = fn(vars);
    $resultRoot.classList.remove('error');
  } catch (e) {
    console.error(e);
    $resultRoot.innerHTML = e.message;
    $resultRoot.classList.add('error');
  }
}


showResult();