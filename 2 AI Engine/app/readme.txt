SSH into the VM
create a directory named 'app'
copy all files from this folder to 'app' folder in VM
cd to 'app'
run following command
"uvicorn main:app --host 0.0.0.0 --port 9193 &" (hit enter)
"disown" (hit enter)
FastAPI is up and running and deattached,
close the SSH.