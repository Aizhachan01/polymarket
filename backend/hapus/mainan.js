
import { createTestUser } from "../tests/helpers/database.js";
import { getUserById } from "../src/services/userService.js";
import { addPointsToUser } from "../src/services/userService.js";

async function mainan()  { 
    

    // menentukan user id 
    let userid ; 
    const testUser = await createTestUser() ; 
    userid = testUser.id ; 


    // melakukan tindakan user id  

    const  user = await getUserById(userid) ; 
    const balance = parseFloat(user.points_balance) ; 

    // update balance nya 

    const point_update = await  addPointsToUser(userid , 400) ; 
    console.log(point_update) ; 
    const update = point_update.points_balance ;
    

    console.log(`poin awal nya segini ${balance} setelah di update jadi ${update} `)







}


mainan() ; 



