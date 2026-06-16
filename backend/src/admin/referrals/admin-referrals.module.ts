import { Module, forwardRef } from "@nestjs/common"
import { ReferralsModule } from "../../referrals/referrals.module"
import { AdminReferralsController } from "./admin-referrals.controller"

@Module({
  imports: [forwardRef(() => ReferralsModule)],
  controllers: [AdminReferralsController],
})
export class AdminReferralsModule {}
