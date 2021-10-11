import { IResolvers } from "@graphql-tools/utils/Interfaces"
import { Context } from "@src/graphql/prismaContext"
import { getRandomIntString } from "@src/utils/numberFunctions"
import { removeSpecialChar } from "../../../utils/stringFunctions"

function generatePublicId(name: string): string {
  return `${name}#${getRandomIntString(5)}`
}

const userMutations: IResolvers = {
  Mutation: {
    createUser: async (_root, args, context: Context) => {
      const { data } = args
      const emailAlreadyExists = await context.prisma.user.findFirst({ where: { email: data.email } })

      if (emailAlreadyExists) throw new Error("Email is already in use")

      const user = { ...data, name: removeSpecialChar(data.name) }
      let publicId = generatePublicId(user.name)
      user.publicId = publicId
      // TO DO : Verify unique publicId

      return await context.prisma.user.create({ data: user })
    },
    updateUser: async (_root, args, context: Context) => {
      return await context.prisma.user.update({ where: { id: Number(args.id) }, data: { ...args.data } })
    },
    deleteUser: async (_root, args, context: Context) => {
      return await context.prisma.user.delete({ where: { id: Number(args.id) } })
    },
  },
}
export default userMutations