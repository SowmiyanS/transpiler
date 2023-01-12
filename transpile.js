const fs = require('fs'); // Import fs module
const out = 'out.html';
const temp = 'temp.html';
const input = 'test.txt';

var es = '<br>';
const file = fs.readFileSync(input, 'utf8').replace(/(\r\n|\n|\r)/gm, es); // Reading the [input] file and replacing the newline character with the [es] (escape) = <br>
var log = true;
var logmax = true;

var map = new Map();
var n = 0;
var map2 = new Map();
var map3 = new Map();
var list = false;
var para = false;
var pd = false;
var root = '<div>';
var rootend = '</div>';

var j = 0; // Main counter variables

if(log)
{
    console.log(j+" : The read file is : "+file);
}

try
{
    fs.writeFileSync(temp, '');
}
catch(err)
{
    console.log(err);
}

function append(char)
{
    try
    {
        fs.appendFileSync(temp, char);
        //appendFileSync(fs, char, 'utf8');
    }
    catch(err)
    {
        // Handle the error
        console.error(err);
    }
}

append(root);  // Writing the root tag

while(j !== '')  // Main loop
{
    switch(file.charAt(j).toString())
    {
        case '#':
            append('<h4>');
            n = file.indexOf('<br>', j);
            map.set(n, '</h4>');
            if(log){ console.log(j+" : Encountered #, next <br> is at "+n+"."); };
            j = j + 1;
            break;
        case '-':
            if(file.startsWith('-*', j))
            {
                append('<b>');
                n = file.indexOf('<br>', j);
                map.set(n, '</b><br >');
                if(log){ console.log(j+" : Detected Bold line end at "+n+"."); };
                j = j + 2; // Need to skip the * to avoid for misdetection for a list.
                break;
            }
            else if(file.charAt(j) === '-')
            {
                append('<b>');
                n = file.indexOf(' ', j);
                map.set(n, '</b>');
                if(log){ console.log(j+" : Detected Bold word end at "+n+"."); };
                j = j + 1;
                break;
            }


        case '*':
            if(list)
            {
                append('<li>');
                n = file.indexOf('<br>', j);
                map.set(n, '</li>');
                if(log){ console.log(j+" : Detected list item end at "+n+"."); };
                if(file.lastIndexOf('*') === j)
                {
                    map2.set(n, '</ul>');
                    list = false;
                    if(log){ console.log(j+" : Detected the list end."); };
                }
                j = j + 1;
                break;
            }
            else
            {
               append('<ul>');
               list = true;
               append('<li>');
               n = file.indexOf('<br>', j);
               map.set(n, '</li>');
               if(log){ console.log(j+" : Detected list item end at "+n+"."); };
               j = j + 1;
               break;
            }

        default :
            if(file.charAt(j) === '\\')
            {
                if(log){ console.log(j+" : Encountered \\ writing the next element to [out] and skipping."); };
                j = j + 1; // Intentionally incremented j to discard '\'
                append(file.charAt(j));
                j = j + 1;
                break;
            }
            else if(file.charAt(j) === '^')
            {
                if(log){ console.log(j+" : Encountered ^ checking for termination.") };
                if(file.startsWith('^<br>', j))
                {
                    if(log){ console.log(j+" : Termination sequence [^<br>] confirmed stopping."); };
                    j = '';
                    break;
                }
                else
                {
                    if(log){ console.log(j+" : Termination sequence negative."); };
                    append(file.charAt(j));
                    j = j + 1;
                    break;
                }
            }
            else
            {
                if(para)
                {
                    if(pd)
                    {
                        if(logmax){ console.log(j+" : Appending '"+file.charAt(j)+"'.") };
                        append(file.charAt(j));
                        j = j + 1;
                        break;
                    }
                    else
                    {
                        n = file.indexOf('<br>', j);
                        map3.set(n, '</p>');
                        pd = true;
                        if(log){ console.log(j+" : Detected the paragraph end at "+n+"."); };
                        break;
                    }
                }
                else if(file.indexOf('br>', j)) // Need to find a better condition to check for paragraph detections as false detections are very high now.
                {
                    append('<p>', j);
                    append(file.charAt(j));
                    j = j + 1;
                    para = true;
                    break;
                }

            }
    }
    if(map.has(j))
    {
        append(map.get(j));
        if(logmax){ console.log(j+" : Appending '"+map.get(j)+"' from map."); };
    }
    if(map2.has(j))
    {
        append(map2.get(j));
        if(logmax){ console.log(j+" : Appending '"+map2.get(j)+"' from map2."); };
    }
    if(map3.has(j))
    {
        append(map3.get(j));
        para = false;
        pd = false;
        if(logmax){ console.log(j+" : Appending '"+map3.get(j)+"' from map3."); };
    }
}

append(rootend);  // Closing root tag

const outfile = fs.readFileSync(temp, 'utf8').replace(/(\r\n|<br>|\r)/gm, '\n');

try
{
    fs.appendFileSync(out, outfile.toString());
    //appendFileSync(fs, char, 'utf8');
}
catch(err)
{
    // Handle the error
    console.error(err);
}
