package com.sisvet.service;

import com.sisvet.dto.request.LoginRequestDTO;
import com.sisvet.dto.response.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
}
