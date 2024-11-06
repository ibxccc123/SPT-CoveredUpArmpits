import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

class Mod implements IPostDBLoadMod
{
    public postDBLoad(container: DependencyContainer): void
    {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables: IDatabaseTables = databaseServer.getTables();
        const logger = container.resolve<ILogger>("WinstonLogger");
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");
        const items = Object.values(tables.templates.items);

        //Filters out armor vests and chest rigs 
        const bodyArmors = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.ARMOR) || itemHelper.isOfBaseclass(x._id, BaseClasses.VEST));

        for (const bodyArmor of bodyArmors) 
        {
            //Finds the slot corresponding to soft armor in the front.  It will cover the additional thorax hitboxes.   
            const softArmorFront = bodyArmor._props.Slots.find(slot => slot._name.toLowerCase() == "soft_armor_front")

            if (softArmorFront) 
            {
                //Gets the front soft plate.  
                const softArmorFrontPlate = tables.templates.items[softArmorFront._props.filters[0].Plate];
                //Adds full side hitboxes for body armor with no soft side coverage (e.g. 6B3TM-01), and only armpit hitboxes for armor with soft side coverage (e.g. ANA Tactical M1)
                bodyArmor._props.Slots.find(slot => slot._name.toLowerCase() == "soft_armor_left") && !(softArmorFrontPlate._props.armorColliders.includes("LeftSideChestUp"))
                //Adds only armpit hitboxes to the soft armor plate
                ? (softArmorFrontPlate._props.armorColliders.push("LeftSideChestUp", "RightSideChestUp"), 
                softArmorFront._props.filters[0].armorColliders.push("LeftSideChestUp", "RightSideChestUp"))
                //Adds full side hitboxes to the soft armor plate
                : (softArmorFrontPlate._props.armorColliders.push("LeftSideChestUp", "RightSideChestUp", "LeftSideChestDown", "RightSideChestDown"), 
                softArmorFront._props.filters[0].armorColliders.push("LeftSideChestUp", "RightSideChestUp", "LeftSideChestDown", "RightSideChestDown"));
            }

        }

    }
}

export const mod = new Mod();
