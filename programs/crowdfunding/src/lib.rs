use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String) -> Result<()> {
        //recieve account from campaign
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        //*ctx.accounts.user.key = msg.sender
        account.admin = *ctx.accounts.user.key;
        Ok(())
    }
}

//a macro
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000)]
    pub campaign: Account<'info, Campaign>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}