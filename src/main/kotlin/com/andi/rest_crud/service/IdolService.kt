package com.andi.rest_crud.service

import com.andi.rest_crud.dto.IdolRequest
import com.andi.rest_crud.dto.IdolResponse
import com.andi.rest_crud.model.Idol
import com.andi.rest_crud.repository.IdolRepository
import org.springframework.stereotype.Service

@Service
class IdolService(
    private val idolRepository: IdolRepository
) {

    // TODO(A&I): DB에 저장된 전체 아이돌 목록을 조회하도록 바꿔보세요.
    // HINT(A&I): 이제 메모리 리스트가 아니라 repository에서 데이터를 가져와야 합니다.
    // CHECK(A&I): GET /idols 호출 시 DB에 저장된 값이 리스트로 내려오는지 확인하세요.
    fun getAll(): List<IdolResponse> {
        TODO("idolRepository.findAll() 결과를 IdolResponse 목록으로 변환해 반환하세요.")
    }

    // TODO(A&I): id로 아이돌을 조회할 때 repository를 사용하도록 바꿔보세요.
    // HINT(A&I): findById(id)를 사용하고, 값이 없으면 예외를 던져도 됩니다.
    // CHECK(A&I): 없는 id 조회 시 어떤 응답이 나오는지 함께 확인하세요.
    fun getById(id: Long): IdolResponse {
        TODO("idolRepository.findById(id)를 사용해 IdolResponse를 반환하세요.")
    }

    // TODO(A&I): 새 아이돌 등록 시 repository.save(...)를 사용하도록 바꿔보세요.
    // HINT(A&I): 이제 id는 JPA가 생성하므로 직접 증가시키지 않아도 됩니다.
    // CHECK(A&I): POST /idols 호출 후 DB 테이블에 실제 데이터가 들어가는지 확인하세요.
    fun create(request: IdolRequest): IdolResponse {
        val idol = Idol(
            name = request.name,
            group = request.group,
            agency = request.agency,
            debutYear = request.debutYear
        )
        TODO("Idol을 생성한 뒤 idolRepository.save(...) 결과를 IdolResponse로 반환하세요.")
    }

    // TODO(A&I): 수정도 DB 기반으로 동작하도록 바꿔보세요.
    // HINT(A&I): 먼저 기존 Idol을 조회한 뒤 필드를 바꾸고 save(...) 하면 됩니다.
    // CHECK(A&I): PUT /idols/{id} 호출 후 다시 조회했을 때 값이 바뀌었는지 확인하세요.
    fun update(id: Long, request: IdolRequest): IdolResponse {
        TODO("repository로 기존 Idol을 조회하고 값을 바꾼 뒤 save(...) 결과를 반환하세요.")
    }

    // TODO(A&I): 삭제도 DB에서 제거되도록 바꿔보세요.
    // HINT(A&I): deleteById(id)를 사용하거나, 먼저 조회 후 delete(...) 해도 됩니다.
    // CHECK(A&I): DELETE /idols/{id} 호출 후 DB에서 실제로 지워졌는지 확인하세요.
    fun delete(id: Long) {
        TODO("DB에서 해당 id의 Idol을 삭제하세요.")
    }
}
