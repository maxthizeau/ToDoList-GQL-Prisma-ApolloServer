import { IResolvers } from "@graphql-tools/utils/Interfaces"
import { Context } from "@src/graphql/prismaContext"
import { getRandomIntString } from "@src/utils/numberFunctions"
import { rules } from "../../accessRules"
import { Prisma } from ".prisma/client"

const teamMutations: IResolvers = {
  Mutation: {
    createTeam: async (_root, args, context: Context) => {
      // Only logged user can create a team
      const access: any = rules.isLoggedIn(context)
      if (!access) {
        throw new Error("You don't have permission to access this resource")
      }

      let data: Prisma.TeamCreateInput = args.data
      // Create the relation UserOnTeam for the loggedin user
      // TODO : Differenciate when the admin create a team

      data = { ...data, members: { create: { userId: context.user.id, isAdmin: true } } }

      return await context.prisma.team.create({ data })
    },
    updateTeam: async (_root, args, context: Context) => {
      // Access : A user should be able to update a team only if he is admin of the team
      const access: any = await rules.canUpdateTeam(context, args.id)
      if (!access) {
        throw new Error("You don't have permission to access this resource")
      }

      return await context.prisma.team.update({ where: { id: Number(args.id) }, data: { ...args.data } })
    },
    deleteTeam: async (_root, args, context: Context) => {
      // TODO : Access : A user should be able to delete the team if he is admin of the team.
      // But it should either delete the boards attached to it or transfer it to the owner of the board
      // For the moment, only a root admin can delete a team.

      const access: any = rules.isAdmin(context)
      if (!access) {
        throw new Error("You don't have permission to access this resource")
      }
      return await context.prisma.team.delete({ where: { id: Number(args.id) } })
    },
  },
}
export default teamMutations
