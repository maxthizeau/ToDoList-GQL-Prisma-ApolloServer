// import { QueryAllBoardsArgs } from "@src/generated/graphql"
import { IResolvers } from "@graphql-tools/utils/Interfaces"
import { Context } from "@src/graphql/prismaContext"
import { getWhereSortByFirstSkipRequest } from "@src/graphql/resolvers/resolverFunctions"
import { Prisma } from ".prisma/client"
import { rules } from "../../accessRules"

const userQueries: IResolvers = {
  Query: {
    user: async (_parent, args, context: Context) => {
      let access: any = rules.isLoggedIn(context)
      if (!access) {
        throw new Error("You don't have permission to access this resource")
      }
      return await context.prisma.user.findUnique({ where: { id: Number(args.where.id) } })
    },
    allUsers: async (_parent, args, context: Context) => {
      let access: any = rules.isLoggedIn(context)
      if (!access) {
        throw new Error("You don't have permission to access this resource")
      }
      const queryArgs = getWhereSortByFirstSkipRequest(args)
      const result = await context.prisma.user.findMany(queryArgs)
      return result
    },
  },
  User: {
    boards: async (parent, args, context: Context) => {
      // TODO : access restricted to boards that parent can see
      if (!parent.id) return []
      const argsRequest = getWhereSortByFirstSkipRequest(args)
      argsRequest.where = { ...argsRequest.where, ownerId: parent.id }
      const result = await context.prisma.board.findMany(argsRequest)
      return result
    },
    // To do UserOnTeam
    // teams: async (parent, args, context: Context) => {
    //   if (!parent.id) return []
    //   console.log("teamsMember requested")
    //   const argsRequest = getWhereSortByFirstSkipRequest(args)
    //   // argsRequest.where = { ...argsRequest.where, members: { has: _parent.id } }
    //   const result = await context.prisma.team.findMany(argsRequest)
    //   return result
    // },
  },
}
export default userQueries
