let projectID;
const hub_id = "b.24d2d632-e01b-4ca0-b988-385be827cb04"
let accountID;
let namingStandardID;
let clientID;
let clientSecret;

let accessTokenDataRead;
let accessTokenDataWrite;
let accessTokenDataCreate;
let accessTokenAccountRead;
let accessTokenAccountWrite;

let webhookTemplateList;
let webhookFolderList;

let postRate = 0;
let getRate = 0;
let postTotalCount = 0;
let progress
let totalFolders
let progressSub
let completedSub

let startfolder_list = []
let folderList_Main =[]
let filteredFolderList = []