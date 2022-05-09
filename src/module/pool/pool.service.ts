import { FollowingsOutput } from '@dto/following/following.dto';
import { CreatePoolDto, getStakingDto, StakePoolDto } from '@dto/pool/stake-pool.dto';
import { SearchDetailDto, SearchDto } from '@dto/search/search.dto';
import { SearchUserDetailDto } from '@dto/user/search-user.dto';
import { Pool, PoolDocument } from '@entity/pool.entity';
import { HashtagsService } from '@hashtag/hashtags.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsSearchService } from '@post/providers/posts-search.service';
import { PostsService } from '@post/providers/posts.service';
import { UsersSearchService } from '@user/providers/users-search.service';
import { stakingPoolABI, stakingPoolAddress } from '@util/constants';
import { SearchAllDetailFilter, SearchUserFilter } from '@util/enums';
import { noResultPaginate } from '@util/paginate';
import { Model } from 'mongoose';
import { PlacesService } from '../places/providers/places.service';
const Web3 = require('web3');


@Injectable()
export class PoolService {
  constructor(
    @InjectModel(Pool.name) private readonly poolModel: Model<PoolDocument>,

    private readonly postsSearchService: PostsSearchService,
    private readonly usersSearchService: UsersSearchService,
    private readonly postsService: PostsService
  ) { }
  public async verifyMaxStake(
    stakePoolDto: StakePoolDto, userId: string
  ): Promise<void> {
    const { poolId, walletAddress } = stakePoolDto
    const privateKey = '2ee492573e41c6d7031a4a8ef438d245ccaa4bb9a5d7a53a144130e2994ca3b5';

    const provider = "https://rinkeby.infura.io/v3/5fe01887b9cb4630aff846c9a9d528ac"
    const web3 = new Web3(provider);

    const stakingPoolContract = new web3.eth.Contract(
      JSON.parse(stakingPoolABI),
      stakingPoolAddress
    )

    const maxStake: any = await this.postsService.getUsersInterac(userId)
    console.log(walletAddress)
    console.log(web3.utils.toWei(String(maxStake?.interac), 'ether'))
    const messageHash = await stakingPoolContract.methods.getMessageHash(poolId, walletAddress, web3.utils.toWei(String(maxStake?.interac), 'ether')).call();
    console.log(messageHash)

    const signature = await web3.eth.accounts.sign(messageHash, privateKey)
    console.log(signature)
    return signature
  }

  public async createPool(createPoolDto: CreatePoolDto): Promise<void> {
    await new this.poolModel(createPoolDto).save();
  }

  public async getListPool(): Promise<any> {
    const provider = "https://rinkeby.infura.io/v3/5fe01887b9cb4630aff846c9a9d528ac"
    const web3 = new Web3(provider);

    const stakingPoolContract = new web3.eth.Contract(
      JSON.parse(stakingPoolABI),
      stakingPoolAddress
    )
    const pool = await stakingPoolContract.methods.linearPoolInfo(Number(0)).call();

    const format = {
      apr: pool?.APR,
      lockDuration: pool?.lockDuration,
      totalStaked: web3.utils.fromWei(String(pool?.totalStaked), 'ether'),
      minInvestment: web3.utils.toWei(String(pool?.minInvestment), 'ether')
    }
    console.log(format)
    return format
  }

  public async getStakingDataOfAddress(getStakingDto: getStakingDto, userId: string): Promise<any> {
    const provider = "https://rinkeby.infura.io/v3/5fe01887b9cb4630aff846c9a9d528ac"
    const web3 = new Web3(provider);

    const stakingPoolContract = new web3.eth.Contract(
      JSON.parse(stakingPoolABI),
      stakingPoolAddress
    )
    const maxStake: any = await this.postsService.getUsersInterac(userId)

    const data = await stakingPoolContract.methods.linearStakingData(Number(0), getStakingDto.walletAddress).call();
    console.log(data)
    const format = {
      yourStaked: web3.utils.fromWei(String(data?.balance), 'ether'),
      joinTime: data?.joinTime,
      updatedTime: data?.updatedTime,
      minInvestment: web3.utils.fromWei(String(data?.userMinInvestment), 'ether'),
      maxStake: String(maxStake?.interac)
    }
    return format
  }

}
