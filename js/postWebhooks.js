document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submitButton').addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Record the start time
        const startTime = performance.now();

        // Update the HTML element with the elapsed time
        //updateElapsedTime(startTime);

        // Call the searchAndPerformAction function here
        await addWebhooks(startfolder_list);

        // Record the end time
        const endTime = performance.now();

        // Calculate the elapsed time in milliseconds
        const elapsedTime = startTime;

    });

});

async function addWebhooks(startfolder_list){

    if(startfolder_list.length === 0){
        alert("Please enter a URL before clicking start")
    }else{
        try {
            accessTokenDataWrite = await getAccessToken("data:write");
        } catch {
            console.log("Error: Getting Create Access Token");
        }
        try {
            accessTokenDataCreate = await getAccessToken("data:read data:write");
        } catch {
            console.log("Error: Getting Create Access Token");
        }
        try {
            accessTokenDataRead = await getAccessToken("data:read");
        } catch {
            console.log("Error: Getting Read Access Token");
        }
        try {
            await getWebhookLists()
            await getFolderList(accessTokenDataRead,startfolder_list)
            //console.log(folderList_temp)
            //convertToArray(foldersMIDP)
            console.log(folderList_Main)
            filteredFolderList = folderList_Main.filter(item => {
                // Check if ACC_Folder_Name ends with any value in folderNameEnd
                return webhookTemplateList.some(end => item.folderNameEnd.endsWith(end.ACC_Folder_Name));
            });

            for (let i = 0; i < filteredFolderList.length; i++) {
                let callback_value = webhookTemplateList.find(item => item.ACC_Folder_Name === filteredFolderList[i].folderNameEnd);
                filteredFolderList[i].callback = callback_value.Callback_Link
                
            }
            console.log(filteredFolderList)
            await postWebhook(filteredFolderList)
        } catch {
            console.log("Error: Geting folder list");
        }

        //console.log("Waiting for a minute...");
        //await delay(60000); // Wait for a minute (60 seconds or 60000 milliseconds)
        //await searchAndPerformAction(access_token_create,folderList_Main);

        const progressBarContainer = document.querySelector('.progress-bar__container');
        const progressBar = document.querySelector('.progress-bar-Main');
        const progressBarText = document.querySelector('.progress-bar-Main__text');
        progress = 100

        if(progress == 100){
            gsap.to(progressBar, {
              x: `${progress}%`,
              duration: 0.5,
              backgroundColor: '#4895ef',
              onComplete: () => {
                progressBarText.style.display = "initial";
                progressBarContainer.style.boxShadow = '0 0 5px #4895ef';
                alert("Webhooks Added to project folders");
              }
            })};


    }

    }

async function getFolderList(accessTokenDataRead, startFolderList, parentFolderPath) {
    try {
        // Array of folder names to skip
        const foldersToSkip = webhookFolderList;
        //console.log(foldersToSkip)
        const folderNametoSkip = ["0A.INCOMING","0B.GENERAL","Z.PROJECT_ADMIN","ZZ.SHADOW"]

        for (const startFolder of startFolderList) {
            let rawfolderList = await getfolderItems(startFolder.folderID, accessTokenDataRead, projectID);
            if (!rawfolderList || !rawfolderList.data || !Array.isArray(rawfolderList.data)) {
                throw new Error("Error getting folder items: Invalid folderList data");
            }
            let folderList = rawfolderList.data.filter(item => {
                // Check if ACC_Folder_Name ends with any value in folderNameEnd
                return !foldersToSkip.some(end => item.id.endsWith(end.FolderID));
            });
            //console.log(folderList)
            if (getRate >= 290) {
                console.log("Waiting for 10 Seconds..."); // Displaying the message for a 60-second delay
                await delay(10000); // Delaying for 60 seconds
            } else {
                const promises = folderList.map(async folder => {
                    if (folder.type === 'folders') {
                        const folderID = "folderID: " + folder.id;
                        var folderNameLocal = "folderName: " + folder.attributes.name;
                        const fullPath = parentFolderPath ? parentFolderPath + '/' + folderNameLocal.split(': ')[1] : folderNameLocal.split(': ')[1];
                        var EndFolder = folderNameLocal.replace('folderName: ', '');
                        folderList_Main.push({ folderID: folder.id, folderPath: fullPath,folderNameEnd: EndFolder ,project_name: projectName, project_ID: projectID});
                        console.log("Added folder:", folderID, fullPath);
                        // Check if the folderName contains any of the names in foldersToSkip array
                        if(!folderNametoSkip.some(skipFolderName => EndFolder.includes(skipFolderName))){
                            if (!foldersToSkip.some(skipName => folder.id.includes(skipName.FolderID))) {
                                await getFolderList(accessTokenDataRead, [{ folderID: folder.id, folderName: fullPath }], fullPath);
                            }
                        } else {
                            console.log("Skipping getFolderList for folder:", folderID, fullPath);
                        }
                    }
                });
                await Promise.all(promises);
            }
        }
    } catch (error) {
        console.error(error.message);
    }

    }

async function getfolderItems(folder_id,accessTokenDataRead,project_id){

    const headers = {
        'Authorization':"Bearer "+accessTokenDataRead,
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/folders/"+folder_id+"/contents";
    //console.log(apiUrl)
    //console.log(requestOptions)
    signedURLData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        //console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
        getRate++
        console.log(getRate)
    return signedURLData
    }

async function getWebhookLists(){

    const headers = {
        'Content-Type':"application/json"
    };

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const apiUrl = "https://prod-04.uksouth.logic.azure.com:443/workflows/0dde2ad2181d4d01b3c72e0ea2baa41a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cQNtttG1whW_30GLYQJCDqNWPNKtO8VwLY44M1B9VQI";
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        webhookTemplateList = JSONdata.Templates
        console.log(webhookTemplateList)
        webhookFolderList = JSONdata.Webhooks
        webhookFolderList = Object.values(webhookFolderList).filter(item => item.FolderID !== '');
        console.log(webhookFolderList)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
        getRate++
        console.log(getRate)
    return responseData
    }

async function postWebhook(array){
    const bodyData = {
        array
    };

    const headers = {
        'Content-Type': 'application/json',
    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData),
        //mode: 'no-cors'
    };

    const apiUrl = "https://prod-27.uksouth.logic.azure.com:443/workflows/f4515a6645e34fc8a5c6e035fd77fc31/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tqrIVarmdFufZzQu2ft093DuUL4iGIWu6jNR4df5M1Q";
    console.log(apiUrl)
    console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
        console.log(JSONdata)
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));

    return responseData
    }

async function getAccessToken(scopeInput){

    const bodyData = {
        scope: scopeInput,
        };

    const headers = {
        'Content-Type':'application/json'
    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData)
    };

    const apiUrl = "https://prod-18.uksouth.logic.azure.com:443/workflows/d8f90f38261044b19829e27d147f0023/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-N-bYaES64moEe0gFiP5J6XGoZBwCVZTmYZmUbdJkPk";
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data

        //console.log(JSONdata)

        return JSONdata.access_token
        })
        .catch(error => console.error('Error fetching data:', error));


    return responseData
    }

    // Utility function to introduce a delay
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function getProjectDetails(AccessToken,project_id){

        const headers = {
            'Authorization':"Bearer "+AccessToken,
        };

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        const apiUrl = "https://developer.api.autodesk.com/project/v1/hubs/"+hub_id+"/projects/b."+project_id;
        console.log(apiUrl)
        console.log(requestOptions)
        projectData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
            console.log(JSONdata)
            //console.log(JSONdata.uploadKey)
            //console.log(JSONdata.urls)
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));

        return projectData
    }

async function getFolderDetails(AccessToken,project_id,folder_id){

        const headers = {
            'Authorization':"Bearer "+AccessToken,
        };

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/folders/"+folder_id;
        //console.log(apiUrl)
        //console.log(requestOptions)
        signedURLData = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
            //console.log(JSONdata)
            //console.log(JSONdata.uploadKey)
            //console.log(JSONdata.urls)
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
            getRate++
            console.log(getRate)
        return signedURLData
        }
    // Function to extract IDs from URL
async function extractIds(urlInputValue) {
        try {
            const url = new URL(urlInputValue);
            const projectId = url.pathname.split('/')[4];
            const folderId = url.searchParams.get('folderUrn');
            const accesstoken = await getAccessToken("data:read")
            const projectNameL = await getProjectDetails(accesstoken,projectId)
            const folderName = await getFolderDetails(accesstoken,projectId,folderId)


            // Update extracted IDs in the HTML
            document.getElementById('project-id').textContent = projectId;
            document.getElementById('folder-id').textContent = folderId;
            document.getElementById('project-name').textContent = projectNameL.data.attributes.name;
            document.getElementById('start-folder-id').textContent = folderName.data.attributes.name;

            startfolder_list = [
                {folderID: folderId,folderName: folderName.data.attributes.name},
            ]
            projectID = projectId
            projectName = projectNameL.data.attributes.name;

            // Show extracted IDs
            document.getElementById('extracted-ids').style.display = 'block';
            console.log(startfolder_list)
        } catch (error) {
            console.error('Invalid URL:', error.message);
            // Reset extracted IDs if URL is invalid
            document.getElementById('project-id').textContent = '';
            document.getElementById('folder-id').textContent = '';
            document.getElementById('project-name').textContent = '';
            document.getElementById('start-folder-id').textContent = '';

            // Hide extracted IDs
            document.getElementById('extracted-ids').style.display = 'none';
        }
    }

    // Add event listener to input field for pasting URL
    document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('start-folder-url');
    urlInput.addEventListener('paste', (event) => {
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        extractIds(pastedText);
    });
    })